

$(function(){

  let pageCount = 1;
  let prevSearchWord = '';
  let searchWord = '';

  $('.search-btn').on('click', function() {
    searchWord = $('#search-input').val();
    if (searchWord === ''){
      $('.inner').prepend('<div class = "message"><p>検索キーワードが有効ではありません。<br>1文字以上で検索して下さい。</p></div>');
      return false;
    }
    if (searchWord === prevSearchWord) {
      pageCount++;
    } else {
      pageCount = 1;
      prevSearchWord = searchWord;
    }

    const settings = {
      'url': `https://ci.nii.ac.jp/books/opensearch/search?title=${searchWord}&format=json&p=${pageCount}&count=20`,
      'method': 'GET',
      'p': pageCount
    };

    $.ajax(
      settings
    ).done(function (response) {
      const result = response['@graph'];
      displayResult(result);
    }).fail(function (err) {
      displayError(err);
    });
  });

  function displayResult(result) {
    $('.message').remove();
    if (result['@graph'] === undefined){
      $('.inner').prepend('<div class = "message"><p>検索結果が見つかりませんでした。<br>別のキーワードで検索して下さい。</p></div>');
    }
    $.each(result[0].items, function (index, element) {
    const bookdataElement ='<li class="lists-item"><div class="list-inner"><p>タイトル：'
    +((element.title
    ? element.title
    :'不明')
    +'</p><p>作者：')
    + ((element['dc:creator']
    ? element['dc:creator']
    : '不明')
    + '</p><p>出版社：')
    + ((element['dc:publisher']
    ? element['dc:publisher'][0]
    : '不明')
    + '</p><a href=')
    + (element.link['@id']
    +'" target="_blank">書籍情報</a></div></li>');
    $('.lists').prepend(bookdataElement);
    });
  }

  function displayError(err) {
    let errorMassage ='';
    if (err.status === 408){
      errorMassage = 'タイムアウトになりました。(408 Request Timeout)';
    } else if (err.status === 400){
      errorMassage = '構文が無効です（400 Bad Request)';
    } else if (err.status === 404){
      errorMassage = 'サーバーがリクエストされたリソースを発見できません。（404 Not Found）';
    } else {
      errorMassage = 'エラーが発生しました';
    }
    const errorHtml = '<div class = "message"><p>' + errorMassage + '</p></div>';
    $('.inner').prepend(errorHtml);
  }}
);

$('.reset-btn').on('click', function() {
  $('#search-input').val('');
  $('.lists-item').remove();
  $('.message').remove();
});