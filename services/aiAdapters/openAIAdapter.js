class OpenAIAdapter {
  constructor() {
    this.OpenAI = null;
  }

  async init() {
    if (!this.OpenAI) {
      const { OpenAI } = await import('openai');
      this.OpenAI = OpenAI;
    }
  }

  async generarRespuesta(messages) {
    if (!this.OpenAI) {
      await this.init();
    }
    const client = new this.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages
    });
    return completion.choices[0].message.content;
  }
}
module.exports = OpenAIAdapter;