import { handleGetMyProfile } from "@/services/client/MyProfile/__mock__/msw";
import { mockUploadImage } from "@/services/client/UploadImage/__mock__/jest";
import { selectImageFile, setupMockServer } from "@/tests/jest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostForm } from ".";

const user = userEvent.setup();

// テストを書きやすいように、セットアップ関数を用意
function setup() {
  // アサーション用に用意したモック関数(スパイ)
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <PostForm
      title="新規記事"
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInvalid}
    />
  );
  // 記事タイトルを入力するインタラクション関数
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "記事タイトル" });
    await user.type(textbox, title);
  }
  // 記事公開するインタラクション関数
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "公開ステータス" }));
    await user.click(screen.getByRole("button", { name: "記事を公開する" }));
  }
  // 下書き保存するインタラクション関数
  async function saveAsDraft() {
    await user.click(screen.getByRole("button", { name: "下書き保存する" }));
  }
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    onClickSave,
    onValid,
    onInvalid,
  };
}

setupMockServer(handleGetMyProfile());

test("不適正内容で「下書き保存」を試みると、バリデーションエラーが表示される", async () => {
  // https://testing-library.com/docs/user-event/intro
  // We recommend invoking userEvent.setup() before the component is rendered.
  const { saveAsDraft } = setup();
  // セットアップ関数 setup() を実行したら、いきなり保存ボタンを押す
  await saveAsDraft();
  await waitFor(() =>
    expect(
      screen.getByRole("textbox", { name: "記事タイトル" })
    ).toHaveErrorMessage("1文字以上入力してください")
  );
});

test("不適正内容で「下書き保存」を試みると、onInvalid イベントハンドラーが実行される", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  // セットアップ関数 setup() を実行したら、いきなり保存ボタンを押す
  await saveAsDraft();
  // セットアップ関数で用意したスパイを調べる
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});

test("適正内容で「下書き保存」を試みると、onValid イベントハンドラーが実行される", async () => {
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();
  await typeTitle("私の技術記事");
  await selectImage();
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});

test("適正内容で「記事を公開」を試みると、onClickSave イベントハンドラーのみ実行される", async () => {
  const { typeTitle, saveAsPublished, onClickSave, onValid, onInvalid } =
    setup();
  await typeTitle("私の技術記事");
  await saveAsPublished();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});
