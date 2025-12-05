export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Word = {
    id: number;
    word: string;
    meaning: string;
    difficulty: Difficulty;
};
