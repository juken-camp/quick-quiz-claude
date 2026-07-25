export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], quizContext, modePrompt } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `あなたは「Quick Quiz AI」の学習アシスタントです。中学3年生が高校入試に向けて勉強するのを手伝っています。

${modePrompt || `【AIの話し方】タメ口で友達みたいに話してください。
【説明の深さ】用語の意味と重要ポイントをバランスよく説明してください。
【つながりマップ】説明の最後に必ず以下の形式でつながりマップを出してください：
🗺️ **つながりマップ**
・[関連キーワード1]：[一言説明]
・[関連キーワード2]：[一言説明]
・[関連キーワード3]：[一言説明]`}

${quizContext ? `【現在のクイズ情報】\n${quizContext}` : ''}`;

  // 会話履歴を正しく組み立て
  let messages;
  if (history.length > 0) {
    const last = history[history.length - 1];
    if (last.role === 'user' && last.content === message) {
      messages = history;
    } else {
      messages = [...history, { role: 'user', content: message }];
    }
  } else {
    messages = [{ role: 'user', content: message }];
  }

  // user/assistant が交互であることを保証
  const cleaned = messages.filter((m, i) => {
    if (i === 0) return true;
    return m.role !== messages[i - 1].role;
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: cleaned,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return res.status(response.status).json({ error: 'AI API error' });
    }

    const data = await response.json();
    const text = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
