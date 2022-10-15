# これは何？

千葉商科大学国際教養学部では、学生たちを、異なる留学先へ、異なる日程で派遣する。 
留学先からは、毎日の健康観察報告と、2週間に1度の定期報告の2種類を、Googleフォームでの設問を用いて提出させる。
学生には、種類ごとの報告の日程に合わせて、それぞれの留学先のタイムゾーン・夏時間に対応した形で、メールでの通知がなされる。
提出された内容には、複数名の教員が分担して対応する。
こうした一連のしくみ全体を非エンジニアの大学職員などでも運用できるものとする。

# 事前準備

## 開発環境の準備

1. gitをインストールする。
2. nodeをインストールする。
3. yarnをインストールする。

## Googleサイトの作成

1. 定期報告用のGoogleサイトを、ひな形をもとにコピーして作成する。
  * [https://sites.google.com/cuc.global/2022autumn/dashboard](https://sites.google.com/cuc.global/2022autumn/dashboard)
2. このGoogleサイトを公開したURLをコピーしてメモしておく。

## Googleスプレッドシートの作成

1. 定期報告用のスプレッドシートを、ひな形をもとにコピーして作成する（学内限定）。
  * https://docs.google.com/spreadsheets/d/1gXWlfu1Rt22E08ifmPRFlDm7ID4hsRIm6U5wTQDyjEY/edit#gid=363993758
2. 内容を修正する。
  * memberシートを作成する。
  * 健康観察報告についての一連のシートをH:の接頭辞を付けたシート名で作成する。
    * H_configシートを作成する（空でよい）。
    * H_scheduleシートを作成する（O列P列は空でよい）。
    * H_mailTemplateシートを作成する。
    * H_logシートを作成する。
    * H_学生ごと提出状況シートを作成する。
    * H_学生・回ごと提出内容シートを作成する。
  * 定期報告についての一連のシートを「R_」の接頭辞を付けたシート名で、同様に作成する。
4. このスプレッドシートを、定期報告の担当の教員と編集権限で共有する。
5. このスプレッドシートのコンテナバウンドスクリプトのスクリプトエディタを開き、URL中のscriptIdを調べてメモしておく。

## Googleフォームの作成

1. 健康観察報告用のフォームと、定期報告用のフォームを、それぞれのひな形をもとにコピーして作成する（学内限定）。
  * https://docs.google.com/forms/d/18Ct1IirJQp5_ObG_XqQrNVdmUfjAE613nJmRlV--ms8/edit
  * https://docs.google.com/forms/d/1PM2Q5oub0m2XT6XVp7bZkXcLmyXwvIxPEqvBXuxWl48/edit
2. このフォームの編集画面のURLをコピーしてメモしておく。
3. このフォームについて、必要に応じて、セクション1の選択式設問の選択肢の編集、セクション2以降の編集をする。なお、セクション1への設問の追加や削除しないこと。
4. このフォームの編集画面のメニューから「事前入力したURLを取得」を実行し、セクション1の3つの設問に任意の値で回答を記入した状態の「事前入力したURL」をコピーしてメモしておく。

## Google Apps Script APIの有効化

1. 次のURLを開き、Google Apps Script APIを有効化する。 
  * https://script.google.com/home/usersettings　　　

## スプレッドシートのスクリプトの編集・clasp操作

1. 本リポジトリをGitHubからgit cloneする。
2. `yarn install` を実行する。
3. `clasp login` を実行する。表示される指示に従ってGoogleアカウントでの認証をする。
4. リポジトリ内の .clasp.json を編集し、先にメモしておいたGoogleスプレッドシートのコンテナバウンドスクリプトのscriptIdを更新する。
5. `clasp pull`を実行する。
6. 　`yarn push`　を実行する。

## スプレッドシートのスクリプトのデプロイ

1. 　Googleスプレッドシートの「機能拡張->Apps Script」で、スクリプト編集画面を開く。すでに開かれていた場合には、古いものを閉じて、新しく開き直す。
2. 　スクリプト編集画面で、「デプロイ->新しいデプロイ->種類の選択->ウェブアプリ->デプロイ」を実行する。
3. 　デプロイしたウェブアプリのURLをコピーしておく。

## スプレッドシートのconfigシートの設定

1. 定期報告用のGoogleスプレッドシートを開き直す。カスタムメニューとして「設定」が表示されていることを確認する。
2. いずれかの「config」シート(たとえば「H_config」)を選択してから「設定->「config」シート->初期設定」を実行する。
  * プロンプトが開いて、formEditUrl　を聞かれたら、 「定期報告用のフォームのformの編集画面のURL」を記入する。
  * プロンプトが開いて、prefilledFormResponseUrlを聞かれたら、「事前入力したURL」を記入する。
  * プロンプトが開いて、published google site urlを聞かれたら、「Googleサイトを公開したURL」を記入する。
  * プロンプトが開いて、dashboardUrlを聞かれたら、定期報告用のGoogleサイトのURLを記入する。
  * プロンプトが開いて、webappUrlを聞かれたら、ウェブアプリとしてデプロイしたURLを記入する。
3. 同様に他の「config」シートについても初期設定を行い、すべての「config」シートの処理を終える。

## スプレッドシートのscheduleシートでの設定

1. スプレッドシートで、いずれかの「schedule」シートを選択してから、「設定->「schedule」シート->「O列の開始日・P列の終了日を更新」を実行する。
2. 同様に他の「schedule」シートについても初期設定を行い、すべての「schedule」シートの処理を終える。

## リリース

1. Googleサイトで報告の種類ごとのページ内に、「挿入->埋め込む」でウェブアプリをデプロイしたURLを次のように入力し、ページ上にウェブアプリを配置する。
   * 「毎日：健康観察報告」では、デプロイしたURLの末尾に、`?mode=health`を付与する。
   * 「2週間に1度：定期報告」では、デプロイしたURLの末尾に、`?mode=report`を付与する。
3. Googleサイトでサイトを「公開」する。
4. GoogleサイトのURLを関係者向けに通知する。また、健康観察や定期報告の報告期間が開始されたら、学生の@cuc.global宛で、報告を実施するように促すメールが送られるので、そのメールに従って報告をするように指示をする。

# 運用

担当教員が実際に利用するシートは、 「学生ごと提出状況」「学生・回ごと提出内容」の２種類。
「学生ごと提出状況」のシートは、各行が学生で、各回の列に、報告が提出されている場合は提出日時が抽出され転記され表示される。提出締切を過ぎているのに未提出の場合は「未提出」、締切前の場合は空欄、提出不要な回は「-」が表記される。Iカラムに「担当教員所見・メモ」のカラムがあり、こちらには担当教員が自由にメモを書ける。教員間の申し送りにも使うものとする。

「学生・回ごと提出内容」のシートは、各行が学生の各回の報告に用いる。提出不要な回の行は空欄となる。各カラムには、報告内容が抽出されて転記される。マウスオーバーで写真のサムネイルも表示できる。こちらにもメモのカラムがあるので、自由に使って良い。

学生がフォームで報告をすると、随時、その学生の担当教員のcuc.globalのメールアドレスに、報告がなされたことについての通知がなされる。このメール本文内のURLをクリックすると、「学生・回ごと提出内容」のシートの当該行が選択状態の画面にジャンプするので、その内容を閲覧できる。

なお、学生向けの機能として、「schedule」のシートをもとに、こちらで設定された定期報告のスケジュールに応じて、その研修先の学生ひとりひとりの状況に応じて、bccメールで、定期報告に関するリマインドが自動的に通知される。報告開始日には全員に通知、定期報告締切日の1日前・締切日・締切日1日後に未提出者のみに通知される。なお、こうした日時は、学生側にとっての研修先の現地時間（夏時間なども考慮済み）で処理される。

学生と教員のコミュニケーション、定期報告へのフィードバックは、Teamsのチャットで行ってもらうものとする。教員はスプレッドシート上から、https://teams.microsoft.com/l/chat/0/0?users=c0c00XX@st.cuc.ac.jp
のようなリンクで、当該学生とのTeamsチャット画面を開くことができる。学生は自分のWebアプリ画面(ダッシュボード)から、担当教員とのTeamsチャット画面を開くことができる。

学生向けには、https://drive.google.com/file/d/172qHHXXUVA0xOy3g_smB6KnGMcTPoPNa/view?usp=sharing
という、「定期報告の手引き」を提示する。先生方から指導・フィードバックをされる際には、こちらの内容も適宜参照すること。
