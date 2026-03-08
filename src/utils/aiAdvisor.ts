import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数からキーを読み込む（Vite特有の書き方です）
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getDinoAdvice(report: string, partnerName: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // システム指示で役割を固定する
      systemInstruction: `あなたは算数ゲームの相棒恐竜「${partnerName}」です。
      小学生のユーザーを励ます役割です。
      ひらがなを多めに使い、1〜2行の短いセリフで答えてください。`
    });

    const prompt = `今日の学習データ：${report}
    このデータを元に、今日頑張ったことを具体的に1つ褒めてください。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI生成エラー:", error);
    return "きょうも いっしょに がんばろうね！"; // エラー時のフォールバック
  }
}