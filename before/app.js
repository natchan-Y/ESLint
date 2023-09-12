

$(function(){   //HTMLが全て読み込まれた後に読み込む

  let pageCount = 1;          //pageCountを宣言。初期値は１
  let prevSearchWord = "";    //prevSearchWord宣言（空文字を入れて不具合を防ぐ）
  let searchWord = "";        //searchWord宣言（空文字を入れて不具合を防ぐ）

  $('.search-btn').on('click', function() { //検索ボタンをクリックしたときに
    searchWord = $("#search-input").val();  //検索窓に入力された文字を取得
    if (searchWord === ""){                 //もし検索窓が空欄の場合
      $(".inner").prepend('<div class = "message"><p>検索キーワードが有効ではありません。<br>1文字以上で検索して下さい。</p></div>') //エラーメッセージを表示
      return false;                         //処理を終了
    }
    if (searchWord === prevSearchWord) {    //もし、searchWordとprevSearchWordが一緒だったら
      pageCount++;                          //pageCountをプラス１
    } else {                                //異なる場合は
      pageCount = 1;                        //pageCountを1
      prevSearchWord = searchWord;          //prevSearchWord = searchWordと定義
    }

    const settings = {                //settingを定義
      "url": `https://ci.nii.ac.jp/books/opensearch/search?title=${searchWord}&format=json&p=${pageCount}&count=20`, //APIのURL
      "method": "GET", //HTTPメソッドでgetを指定
      "p": pageCount,   //ページはPageCountを指定
    }

    $.ajax(                               //ajaxの処理開始
      settings                            //settingを設定
    ).done(function (response) {          //成功した時の処理
      const result = response['@graph'];  //結果の配列を取得
      displayResult(result)               //displayResultの処理を実行
    }).fail(function (err) {              //失敗した時の処理
      displayError(err)                   //displayErrorの処理を実行
    })
  });

  function displayResult(result) {        //displayResultの処理
    $(".message").remove();               //.messageを削除
    if (result['@graph'] === undefined){  //もし検索結果が０件のときに
      $(".inner").prepend('<div class = "message"><p>検索結果が見つかりませんでした。<br>別のキーワードで検索して下さい。</p></div>'); //検索結果なしのエラーメッセージを表示
    }
    $.each(result[0].items, function (index, element) {  //以下ループ処理
    var bookdataElement ='<li class="lists-item"><div class="list-inner"><p>タイトル：'  //bookdataElementの要素を記載。（htmlを追加し、「タイトル」と表示）
    + ((element.title ? element.title : "不明")  //タイトルのelementがあれば表示し、ない場合は「不明」と表示
    + "</p><p>作者：") + ((element["dc:creator"] ? element["dc:creator"] : "不明")   //「作者：」と表示し、その後作者のelementがあれば表示し、ない場合は「不明」と表示
    + "</p><p>出版社：") + ((element["dc:publisher"] ? element["dc:publisher"][0] : "不明")  //「出版社：」と表示し、その後出版社のelementがあれば表示し、ない場合は「不明」と表示
    + '</p><a href="')+ (element.link["@id"] +'" target="_blank">書籍情報</a></div></li>'); //リンクを作成し「書籍情報」と表示。リンク先は@id
    $(".lists").prepend(bookdataElement) //　listにbookdataElementを追加
    });
  }

  function displayError(err) {   //displayErrorの処理
    if (err.status === 408){     //err.statusが408のときに
      errorMassage = 'タイムアウトになりました。(408 Request Timeout)' //408エラーメッセージの内容
    } else if (err.status === 400){ //err.statusが400のときに
      errorMassage = '構文が無効です（400 Bad Request)' //400エラーメッセージの内容
    } else if (err.status === 404){  //err.statusが404のときに
      errorMassage = 'サーバーがリクエストされたリソースを発見できません。（404 Not Found）' //404エラーメッセージの内容
    } else {     //上記以外のときに
      errorMassage = 'エラーが発生しました' //汎用エラーメッセージの内容
    }
    let errorHtml = '<div class = "message"><p>' + errorMassage + '</p></div>' //エラーメッセージの型
    $(".inner").prepend(errorHtml);  //エラーメッセージを表示
  }}
);

$('.reset-btn').on('click', function() {  //リセットボタンを押したときに
  $("#search-input").val("");  //検索窓に空欄を代入
  $(".lists-item").remove();   //lists-itemを除外
  $(".message").remove();      //.messageを除外
});