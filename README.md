# これは何？

千葉商科大学国際教養学部では、学生たちを、異なる留学先へ、異なる日程で派遣する。 留学先からは、2週間に1度の定期報告をGoogleフォームでの設問を用いて提出させる。 提出された内容には複数名の教員が分担して対応する。
こうした一連のしくみ全体を非エンジニアの大学職員などでも運用できるものとする。

# 事前準備

## 開発環境の準備

1. gitをインストールする。
2. nodeをインストールする。
3. yarnをインストールする。

## Googleサイトの作成

1. 定期報告用のGoogleサイトを、ひな形をもとにコピーして作成する（学内限定）。
  * https://sites.google.com/cuc.global/studyabroad2022/

## Googleスプレッドシートの作成

1. 定期報告用のスプレッドシートを、ひな形をもとにコピーして作成する（学内限定）。
  * https://docs.google.com/spreadsheets/d/1l0442hpP8G_TbBXGImCLhxOzuJUrPiV5QV6sGTEPsZ8/edit?usp=sharing
2. このスプレッドシートを、定期報告の担当の教員と編集権限で共有する。
3. このスプレッドシートのコンテナバウンドスクリプトのスクリプトエディタを開き、URL中のscriptIdを調べてメモしておく。

## Googleフォームの作成

1. 定期報告用のフォームを、ひな形をもとにコピーして作成する（学内限定）。
  * https://docs.google.com/forms/d/1aPCfcWOAecNJ-kUG3ILkMbnBTnT5I0CTIOb4Os62nxY/edit
2. このフォームのURL中のformIdを調べてメモしておく。
3. このフォームについて、必要に応じて、セクション1の選択式設問の選択肢の編集、セクション2以降の編集をする。なお、セクション1への設問の追加や削除しないこと。
4. フォームのHTMLのソースを調べて、冒頭の3つの設問の箇所の「entry.XXXXXX」という表現を探して、XXXXXの部分の数字3つをメモする。
5. このフォームの回答先を、先に作成したスプレッドシートに設定する。

## Google Apps Script APIの有効化

1. 次のURLを開き、Google Apps Script APIを有効化する。 
  * https://script.google.com/home/usersettings　　　

## スプレッドシートのスクリプトの編集・clasp操作

1. 本リポジトリをGitHubからgit cloneする。
2. `yarn install` を実行する。
3. `clasp login --no-localhost` を実行する。表示される指示に従ってGoogleアカウントでの認証をする。
4. リポジトリ内の .clasp.json を編集し、先にメモしておいたGoogleスプレッドシートのコンテナバウンドスクリプトのscriptIdを更新する。
5. 　`yarn push`　を実行する。

## スプレッドシートのスクリプトのトリガー設定・デプロイ

1. 　Googleスプレッドシートのコンテナバウンドスクリプトで、onOpen関数を、スプレッドシートを開く際のトリガーとして設定する。
2. 　Googleスプレッドシートのコンテナバウンドスクリプトで、onTimer関数を、1時間ごとに実行するトリガーとして設定する。
3. 　Googleスプレッドシートのコンテナバウンドスクリプトで、doGet関数を、ウェブアプリとして「デプロイをテスト」し、デプロイ先のURLをメモする。
4. 　Googleスプレッドシートのコンテナバウンドスクリプトで、doGet関数を、ウェブアプリとして「新しいデプロイ」し、デプロイ先のURLをメモする。

## フォームのスクリプトの編集・トリガー設定

1. フォームの「スクリプトエディタ」を開いて、本リポジトリの./srcOnSubmitForm内のappscript.jsonとcode.gsをもとに、GoogleAppsScriptのファイルとして作成する。
2. フォームのトリガーとして、onSubmit関数を設定する。

## スプレッドシートのconfigシートでの設定

1. formId　として、 定期報告用のフォームのformIdを記入する。
2. dashboardUrlとして,  定期報告用のGoogleサイトのURLを記入する。
3. ayearEntryId として、フォームのHTMLのソース内の、履修年次の設問のentryの数値を記入する。
4. studyAtEntryId として、フォームのHTMLのソース内の、研修先の設問のentryの数値を記入する。
5. reportNumEntryId として、フォームのHTMLのソース内の、報告回の設問の「entry.XXXXXX」のXXXXX部分の数値を記入する。
6. webappUrlとして、Googleスプレッドシートのコンテナバウンドスクリプトを「デプロイをテスト」したURLを記入する。

## リリース

1. Googleサイトの「埋め込み」で、ウェブアプリを「新しいデプロイ」したURLを入力し、ページ上に配置する。
2. Webページを「公開」する。
3. WebページのURLを関係者向けに通知する。

# 運用

担当教員が実際に利用するシートは、 「学生ごと提出状況」「学生・回ごと提出内容」の２つ。
「学生ごと提出状況」のシートは、各行が学生で、1回目〜6回目の列に、報告が提出されている場合は提出日時が抽出され転記され表示される。提出締切を過ぎているのに未提出の場合は「未提出」、締切前の場合は空欄、提出不要な回は「-」が表記される。Iカラムに「担当教員所見・メモ」のカラムがあり、こちらには担当教員が自由にメモを書ける。教員間の申し送りにも使うものとする。

「学生・回ごと提出内容」のシートは、各行が学生の各回の報告に用いる。提出不要な回の行は空欄となる。各カラムには、報告内容が抽出されて転記される。マウスオーバーで写真のサムネイルも表示できる。こちらにもメモのカラムがあるので、自由に使って良い。

学生がフォームで報告をすると、随時、その学生の担当教員のcuc.globalのメールアドレスに、報告がなされたことについての通知がなされる。このメール本文内のURLをクリックすると、「学生・回ごと提出内容」のシートの当該行が選択状態の画面にジャンプするので、その内容を閲覧できる。

なお、学生向けの機能として、「schedule」のシートをもとに、こちらで設定された定期報告のスケジュールに応じて、その研修先の学生ひとりひとりの状況に応じて、bccメールで、定期報告に関するリマインドが自動的に通知される。報告開始日には全員に通知、定期報告締切日の1日前・締切日・締切日1日後に未提出者のみに通知される。なお、こうした日時は、学生側にとっての研修先の現地時間（夏時間なども考慮済み）で処理される。

学生と教員のコミュニケーション、定期報告へのフィードバックは、Teamsのチャットで行ってもらうものとする。教員はスプレッドシート上から、https://teams.microsoft.com/l/chat/0/0?users=c0c00XX@st.cuc.ac.jp
のようなリンクで、当該学生とのTeamsチャット画面を開くことができる。学生は自分のWebアプリ画面(ダッシュボード)から、担当教員とのTeamsチャット画面を開くことができる。

学生向けには、https://drive.google.com/file/d/172qHHXXUVA0xOy3g_smB6KnGMcTPoPNa/view?usp=sharing
という、「定期報告の手引き」を提示する。先生方から指導・フィードバックをされる際には、こちらの内容も適宜参照すること。
