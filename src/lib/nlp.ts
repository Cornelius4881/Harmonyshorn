import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

let model: use.UniversalSentenceEncoder | null = null;

export const nlp = {
  async init() {
    if (!model) {
      model = await use.load();
    }
  },

  async analyzeSentiment(text: string): Promise<{ score: number; magnitude: number }> {
    if (!model) await this.init();
    
    const embeddings = await model!.embed([text]);
    const sentimentScore = await tf.tidy(() => {
      const normalized = tf.norm(embeddings);
      return normalized.dataSync()[0];
    });
    
    // Convert to a -1 to 1 scale
    const score = (sentimentScore - 0.5) * 2;
    const magnitude = Math.abs(score);
    
    return { score, magnitude };
  },

  async generateDevotional(scripture: string): Promise<string> {
    // Simple template-based generation
    const templates = [
      "As we reflect on {scripture}, we're reminded of God's endless love and grace.",
      "In {scripture}, we find comfort and guidance for our daily walk.",
      "Today's verse, {scripture}, speaks to our hearts about faith and trust.",
    ];
    
    return templates[Math.floor(Math.random() * templates.length)]
      .replace('{scripture}', scripture);
  },

  async recommendScriptures(query: string): Promise<string[]> {
    const scriptures = [
      "Philippians 4:13 - I can do all things through Christ who strengthens me",
      "Jeremiah 29:11 - For I know the plans I have for you",
      "Psalm 23:1 - The Lord is my shepherd",
      // Add more scriptures as needed
    ];
    
    if (!model) await this.init();
    
    const queryEmbedding = await model!.embed([query]);
    const scriptureEmbeddings = await model!.embed(scriptures);
    
    const similarities = await tf.tidy(() => {
      const similarities = tf.matMul(queryEmbedding, scriptureEmbeddings.transpose());
      return similarities.dataSync();
    });
    
    // Return top 3 most similar scriptures
    return scriptures
      .map((scripture, i) => ({ scripture, similarity: similarities[i] }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.scripture);
  },

  moderateContent(text: string): boolean {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const offensiveWords = ['hate', 'kill', 'stupid', 'dumb']; // Expand this list
    
    return !tokens.some(token => offensiveWords.includes(token));
  }
};