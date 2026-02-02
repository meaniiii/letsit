export default function UnavailablePage() {
  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* 방전 아이콘 */}
        <div className="text-6xl mb-6">🪫</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          열화와 같은 성원으로
          <br />
          방전됐어요
        </h1>

        <p className="text-gray-500 mb-8 max-w-xs">
          오늘 하루 너무 많은 분들이 찾아주셔서
          <br />
          일일 사용량이 소진되었습니다.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 w-full max-w-xs">
          <p className="text-sm text-gray-600 mb-2">내일 다시 만나요!</p>
          <p className="text-xs text-gray-400">
            매일 자정(KST)에 충전됩니다 ⚡
          </p>
        </div>
      </div>
    </div>
  );
}
