// ランクに応じてTailwind CSSのクラス名を返す関数
export const getRankColor = (rank: string) => {
  switch (rank) {
    case 'S':
      return 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500';
    case 'A':
      return 'text-red-500';
    case 'B':
      return 'text-blue-500';
    case 'C':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};