import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RequestHandler } from "msw";
import { setupServer } from "msw/node";

/**
 * MSW (Mock Service Worker) を用いてモックサーバーをセットアップするユーティリティ関数。
 *
 * 使い方:
 *   const server = setupMockServer(handler1, handler2, ...);
 *   // jest のライフサイクルに合わせてサーバーのリッスン、リセット、クローズを行う
 *   // テストコード内でこの関数を呼び出すだけで、モックサーバーが準備される
 */
export function setupMockServer(...handlers: RequestHandler[]) {
  // MSW の setupServer にハンドラを登録
  const server = setupServer(...handlers);

  // Jest のライフサイクルフック (beforeAll, afterEach, afterAll) を使い、
  // テスト全体でサーバーが正しく動作/リセット/クローズされるようにする
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // サーバーインスタンスを返して必要に応じてハンドラの追加/修正などを可能にする
  return server;
}

/**
 * テスト用に画像ファイルを選択するユーティリティ関数。
 *
 * @param inputTestId - テスト対象の file input を取得するための TestId
 * @param fileName - 選択するファイル名
 * @param content - ファイルの中身として使用する文字列
 *
 * 使い方:
 *   const { fileInput, filePath, selectImage } = selectImageFile();
 *   await selectImage(); // 実際に input にファイルがアップロードされる
 */
export function selectImageFile(
    inputTestId = "file",
    fileName = "hello.png",
    content = "hello"
) {
  // userEvent のセットアップ
  const user = userEvent.setup();
  // 偽のファイルパスを作成
  const filePath = [`C:\\fakepath\\${fileName}`];
  // ダミーの File オブジェクトを作成
  const file = new File([content], fileName, { type: "image/png" });
  // screen.getByTestId で入力要素を取得
  const fileInput = screen.getByTestId(inputTestId);
  // 実際にファイルをアップロードするアクションを定義
  const selectImage = () => user.upload(fileInput, file);

  // テストで使う値や関数をまとめて返却
  return { fileInput, filePath, selectImage };
}

// window.location のオリジナルをバックアップしておく
const original = window.location;

/**
 * window.location.reload() を Jest のモック関数に差し替えるユーティリティ関数。
 *
 * return された cleanup 関数を呼び出すと元に戻る。
 *
 * 使い方:
 *   const cleanup = mockWindowLocationReload();
 *   // テストで window.location.reload() が呼ばれたかどうかをテストできる
 *   ...
 *   cleanup(); // 後処理で元の location オブジェクトに戻す
 */
export function mockWindowLocationReload() {
  // Object.defineProperty を使って location をモックに差し替える
  Object.defineProperty(window, "location", {
    writable: true,
    value: { reload: jest.fn() },
  });

  // 元に戻すための関数
  const cleanup = () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: original,
    });
  };
  return cleanup;
}
