//変数定義
var mock;
var xhtml;

var srcMain="";
var srcFooter="";
var resultCode="";
var srcInfo="";
var mainCloseDefine = `
</ui:define>`;

var resultArea;
var copyButton;


// 実行押下時
function convert(){
    //変数定義
    mock=document.getElementById('mockArea').value;
    xhtml=document.getElementById('xhtmlArea').value;
    resultArea=document.getElementById('resultArea');
    copyButton=document.getElementById('copyButton');
    if(mock=="" || xhtml==""){
        alert("ソースを入力してください。");
        isError();
    }else{
        // 変換処理
        cutInfo();
        cutMock();
        convertMain();
        convertFooter();


        //生成結果　結合
        resultCode = srcInfo;
        resultCode += (srcMain + mainCloseDefine + srcFooter);
        resultCode +=`
</ui:composition>`;
        //フッターのみの場合
        if(footerFlg==true){
            resultCode=srcFooter;
        };
        //結果の格納
        resultArea.value=resultCode;
        //画面切替
        document.getElementById('mockArea').hidden=true;
        document.getElementById('xhtmlArea').hidden=true;
        document.getElementById('convertButton').hidden=true;
        resultArea.hidden=false;
        copyButton.hidden=false;
        //ラベル内容
        document.getElementById('label1').textContent="マージ成功";
    };
};

//上部の詳細情報を格納--ok
function cutInfo(){
    var endKakko = xhtml.indexOf(`<ui:define name="contents">`,0)+26;
    srcInfo=xhtml.substring(0,endKakko+1)+`
`;
};


//メイン・フッター分割（モック）
function cutMock(){
    //変数定義
    var startArticle;//開始タグの開始カッコ
    var endArticle;//終了タグの終了カッコ
    var startFooterDiv;//開始タグの開始カッコ
    var endFooterDiv;//終了タグの終了カッコ
    //切り取り処理
    //main
    startArticle=mock.indexOf("<article",0);
    endArticle=mock.indexOf("</article>",0)+9;
    startFooterDiv=mock.indexOf("<footer",0);
    endFooterDiv=mock.indexOf("</footer>",0)+8;
    // main部分の切り取り
    if (startArticle !== -1 && endArticle !== -1) {
        srcMain = mock.substring(startArticle, endArticle+1);
    }else{
        alert("articleタグが見つかりません")
        isError();
    };
    // footer部分の切り取り
    if (startFooterDiv !== -1 && endFooterDiv !== -1) {
        srcFooter = mock.substring(startFooterDiv, endFooterDiv+1);
    }else{
        alert("footerタグが見つかりません");
        isError();
    };
};

//ok
function convertFooter(){
    // 変数定義
    var resultFooter="";//結果保持用
    var startIndex = 0;//検索開始位置
    //大元のdivを追加--ok
    var startBigDiv = srcFooter.indexOf("<div",0);//開始カッコ
    var endBigDiv = srcFooter.indexOf(">",startBigDiv);//終了カッコ
    resultFooter+=`
<!-- フッタコンテンツ -->
<ui:define name="footer">
    `+srcFooter.substring(startBigDiv,endBigDiv+1);
    startIndex=endBigDiv;//検索開始位置を更新
    action();
    //ボタンがあれば種類を判別　なければ</div>を追加
    function action(){
        if(srcFooter.indexOf("<div",startIndex)!=-1){
            //変数定義
            var startDiv=srcFooter.indexOf("<div",startIndex);//開始divタグの開始かっこ
            var startDivClose=srcFooter.indexOf(">",startDiv);//開始divタグの終了かっこ
            var endDiv=srcFooter.indexOf("</div>",startDiv);//終了divタグの開始かっこ
            var block=srcFooter.substring(startDiv,endDiv+6);//ボタン別の<div>から</div>
            //変数定義forプロパティ
            var idP;
            var valueP;
            var styleClassP;
            var actionP;
            //判別--ok
            if(block.indexOf("戻る")!=-1){
                getProperty("戻る");
            }else if(block.indexOf("入力取消")!=-1){
                getProperty("入力取消");
            }else if(block.indexOf("前頁")!=-1){
                getProperty("前頁");
            }else if(block.indexOf("次頁")!=-1){
                getProperty("次頁");
            }else if(block.indexOf("決定")!=-1){
                getProperty("決定");
            }else{
                alert("非対応のフッターボタンが検出されました。（対応：戻る、入力取消、前頁、次頁、決定）");
                isError();
            };
            //プロパティ取得
            function getProperty(bunrui){
                //xhtmlからプロパティを取得**
                var startBunrui=xhtml.indexOf(bunrui,0);//→戻る
                //id--ok
                var startIdP = xhtml.indexOf("id",startBunrui)+4;//id="→○○"
                var endIdDouble = xhtml.indexOf(`"`,startIdP);//id="○○"←
                idP=xhtml.substring(startIdP,endIdDouble);
                //value--ok
                var buttonUTF;
                if(bunrui=="戻る"){
                    buttonUTF="&#xf060;";
                }else if(bunrui=="入力取消"){
                    buttonUTF="&#xF55a;";
                }else if(bunrui=="前頁"){
                    buttonUTF="&#xf0d9;";
                }else if(bunrui=="次頁"){
                    buttonUTF="&#xf0da;";
                }else if(bunrui=="決定"){
                    buttonUTF="&#xf058;";
                };
                valueP=buttonUTF+" "+bunrui;
                //styleClass--ok
                var startClass=srcFooter.indexOf("class",startDivClose);//→class
                var startClassDouble=srcFooter.indexOf('"',startClass);//class=→"○○"
                var endClassDouble=srcFooter.indexOf('"',startClassDouble+1);//class="○○"←
                styleClassP=srcFooter.substring(startClassDouble+1,endClassDouble);
                //actionP--ok
                var startActionP = xhtml.indexOf("action",startBunrui)+8;//action="→○○"
                var endActionDouble = xhtml.indexOf(`"`,startActionP);//action="○○"←
                actionP=xhtml.substring(startActionP,endActionDouble);
                //結果コード追加
                resultFooter+=`
        `+srcFooter.substring(startDiv,startDivClose+1);//<div〇〇>
                resultFooter+=`
            <h:commandButton id="${idP}" value="${valueP}" styleClass="${styleClassP}" action="${actionP}" onclick="return myEvent.${idP}Event(event, this);" />`;
                resultFooter+=`
        </div>`;
            };
            //検索開始位置更新
            startIndex=endDiv+1;
            action();
        }else{
            resultFooter+=`
    </div>
</ui:define>`;
        };
        srcFooter=resultFooter;
    };
};


//srcMainを参照する
function convertMain(){
    //変数定義
    var resultMain;//結合結果格納用
    var resultHeader = "";//ヘッダー部分（明細より上）
    var resultMeisai = "";//明細部分
    var resultEnd = "";//明細より下の閉じタグ
    //インデックス
    var startTable = srcMain.indexOf("<table",0);//→<table
    var endTableKakko = srcMain.indexOf("</table>",0)+7;//</table>←
    //srcMainを３分割--ok
    resultHeader=srcMain.substring(0,startTable);
    resultMeisai=srcMain.substring(startTable,endTableKakko+1);
    resultEnd=srcMain.substring(endTableKakko+1);
    //変換関数実行(ヘッダーと明細のみ)
    // resultHeader = conHeader(resultHeader);
    resultMeisai = conMeisai(resultMeisai);
    //結合--ok
    resultMain=(resultHeader+resultMeisai+resultEnd);
};

//変換　ヘッダー項目用
function conHeader(resultHeader){
    //値保持用
    var result = resultHeader;
    result=toHeaderRadio(result);
    result=toSearch(result);
    result=toSubSearch(result);
    result=toLabel(result);
    result=toTextBox(result);
    //返却
    return result;
};


// function toHeaderRadio(resultHeader){
//     //検索開始位置
//     var start = 0;//xhtml用
//     var startMock = 0;//モック用
//     //配列に格納
//     let array = [];
//     for(let i = 0; i <= resultHeader.length; i++){
//         array[i]=resultHeader[i];
//     };
//     //判定
//     if(resultHeader.indexOf('"radio"',start) != -1){
//     //情報保持　変数
//     var id,gamenID,value;
//     //画面ID取得
//     gamenID=xhtml.substring(xhtml.indexOf("ENG",0),xhtml.indexOf("ENG",0)+8);//ok
//     //id取得
//     var radioIDStart = xhtml.indexOf('"',xhtml.indexOf("<h:selectOneRadio",start));//id=→"--"
//     var radioIDEnd = xhtml.indexOf('"',radioIDStart+1);//id="--"←
//     id=xhtml.substring(radioIDStart+1,radioIDEnd);
//     //value取得
//     var itemStart = xhtml.indexOf('"',radioIDEnd);//value=→"--"
//     var itemEnd = xhtml.indexOf('"',itemStart+1);//value="--"←
//     value=xhtml.substring(itemStart+1,itemEnd);
//     //検索場所更新
//     start = itemEnd;
//     startMock = resultHeader.indexOf("<dl>",resultHeader.indexOf('"radio"',startMock));
//     alert(id)


//     //テンプレート
// `<h:selectOneRadio id="${id}" value="#{${gamenID}.${id}}">
//     <f:selectItems value="${value}"/>
// </h:selectOneRadio>`;
//     return resultHeader;
//     };
// };



function conMeisai(){

}




//フッターのみ変換
var footerFlg = false;
var footerCount = 0;
function footerSwitch(){
    footerCount++;
    if(footerCount % 2 != 0){
        footerFlg=true;
    }else{
        footerFlg=false;
    };
};


//エラー時
function isError(){
    location.reload();
};