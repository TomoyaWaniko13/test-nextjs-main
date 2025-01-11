import { AlertDialog } from "@/components/organisms/AlertDialog";
import { useAlertDialogAction } from "@/components/organisms/AlertDialog/hooks";
import { useToastAction } from "@/components/providers/ToastProvider";
import { createMyPosts } from "@/services/client/MyPosts";
import { useRouter } from "next/router";
import { PostForm } from "./PostForm";

/**
 * MyPostsCreate コンポーネント
 *
 * 新規記事作成画面を表示するコンポーネントです。
 * 新規記事の投稿フォームを提供し、フォームが正しく入力された場合に記事を保存・公開します。
 * また、記事の公開前にアラートダイアログを表示し、ユーザーに確認を促します。
 */
export const MyPostsCreate = () => {
  // Next.js のルーターオブジェクトを取得
  // ページ遷移に使用
  const router = useRouter();

  // Toast を表示するアクションを取得
  // showToast でメッセージを表示できる
  const { showToast } = useToastAction();

  // AlertDialog を制御するアクションを取得
  // showAlertDialog, hideAlertDialog を使ってダイアログを表示/非表示
  const { showAlertDialog, hideAlertDialog } = useAlertDialogAction();

  return (
      /**
       * PostForm は共通のフォームコンポーネント
       * title: フォームの見出し
       * onClickSave: 「公開する」/「保存する」ボタンが押されたときに呼び出されるイベントハンドラ
       * onValid: フォームのバリデーションが成功したときに呼び出されるイベントハンドラ
       * onInvalid: フォームのバリデーションが失敗したときに呼び出されるイベントハンドラ
       * 子要素として <AlertDialog /> を渡すことで、アラートを表示できるようにしている
       */
      <PostForm
          title="新規記事"
          /**
           * 記事公開ボタンを押した際のイベントハンドラ
           * 引数 isPublish は「公開する」ボタンが押されたかどうかを示すフラグ
           */
          onClickSave={(isPublish) => {
            // 「公開する」が押されなかった場合は何もしない
            if (!isPublish) return;
            // 「公開する」が押された場合はアラートダイアログを表示して確認を促す
            showAlertDialog({ message: "記事を公開します。よろしいですか？" });
          }}
          /**
           * フォームのバリデーションが成功した際に実行されるイベントハンドラ
           * input: フォームから受け取った入力データ
           */
          onValid={async (input) => {
            // 公開か保存かでメッセージを切り替える
            const status = input.published ? "公開" : "保存";

            // 記事を公開するフローの場合、アラートダイアログを閉じる
            if (input.published) {
              hideAlertDialog();
            }

            try {
              // Toast で「保存中…」というメッセージを、ビジースタイルで表示
              showToast({ message: "保存中…", style: "busy" });

              // createMyPosts APIをコールして記事を新規作成
              // 戻り値から記事のIDを取得
              const { id } = await createMyPosts({ input });

              // 新規作成後、作成した記事の編集ページへ遷移
              await router.push(`/my/posts/${id}`);

              // Toast で「保存または公開に成功した」旨を表示
              showToast({ message: `${status}に成功しました`, style: "succeed" });
            } catch (err) {
              // エラーが発生した場合は Toast で「保存または公開に失敗した」旨を表示
              showToast({ message: `${status}に失敗しました`, style: "failed" });
            }
          }}
          /**
           * フォームのバリデーションが失敗した際に実行されるイベントハンドラ
           * アラートダイアログが表示されている場合は閉じる
           */
          onInvalid={() => {
            hideAlertDialog();
          }}
      >
        {/* アラートダイアログのコンポーネントを配置
          このコンポーネントを配置することで、アラートダイアログが表示できる */}
        <AlertDialog />
      </PostForm>
  );
};
