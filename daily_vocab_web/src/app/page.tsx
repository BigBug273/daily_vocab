"use client";

import { useState, useEffect, useCallback } from 'react';
import { Word, Difficulty } from '@/types';

export default function Home() {
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [sentence, setSentence] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [feedbackColor, setFeedbackColor] = useState<string>('text-gray-700');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [level, setLevel] = useState<string>("");
    const [suggestion, setSuggestion] = useState<string>("");
    const [correctedSentence, setCorrectedSentence] = useState<string>("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch random word from FastAPI
    const getRandomWord = useCallback(async () => {
        const response = await fetch(`${apiUrl}/api/word`);
        const apiWord = await response.json();

        const normalizedWord = {
            id: apiWord.id,
            word: apiWord.word,
            meaning: apiWord.definition,
            difficulty: apiWord.difficulty_level,
        };

        setCurrentWord(normalizedWord);
        setSentence('');
        setScore(0);
        setFeedbackColor('text-gray-700');
        setIsSubmitted(false);
    }, [apiUrl]);

    useEffect(() => {
        getRandomWord();
    }, [getRandomWord]);

    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSentence(e.target.value);
        if (isSubmitted) {
            setScore(0);
            setFeedbackColor('text-gray-700');
            setIsSubmitted(false);
        }
    };

    // SUBMIT SENTENCE TO BACKEND AI
    const handleSubmitSentence = async () => {
        if (!currentWord) return;

        const response = await fetch(`${apiUrl}/api/validate-sentence`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                word_id: currentWord.id,
                sentence: sentence
            })
        });

        const result = await response.json();

        setScore(result.score);

        if (result.score >= 8.0) {
            setFeedbackColor("text-success");
        } else if (result.score >= 6.0) {
            setFeedbackColor("text-warning");
        } else {
            setFeedbackColor("text-danger");
        }

        setLevel(result.level);
        setSuggestion(result.suggestion);
        setCorrectedSentence(result.corrected_sentence);

        setIsSubmitted(true);
    };

    const handleNextWord = () => {
        getRandomWord();
    };

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case "Beginner":
                return "bg-green-200 text-green-800";
            case "Intermediate":
                return "bg-yellow-200 text-yellow-800";
            case "Advanced":
                return "bg-red-200 text-red-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    if (!currentWord) {
        return <div className="flex justify-center items-center h-screen">Loading word...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-gray-800 leading-tight">Word Challenge</h1>

            <div className="bg-white p-8 rounded-2xl shadow-xl mb-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-0">{currentWord.word}</h2>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(currentWord.difficulty)} shadow-md`}>
                        {currentWord.difficulty}
                    </span>
                </div>

                <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">{currentWord.meaning}</p>

                <div className="mb-6">
                    <label htmlFor="sentence" className="block text-base font-medium text-gray-700 mb-2">Your Sentence:</label>
                    <textarea
                        id="sentence"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-200 ease-in-out resize-y text-lg"
                        rows={4}
                        placeholder="Type your sentence here..."
                        value={sentence}
                        onChange={handleSentenceChange}
                        disabled={isSubmitted}
                    ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <p className="text-2xl font-bold">
                        Score: <span className={`${feedbackColor} transition-colors duration-300`}>{score.toFixed(1)}</span>
                    </p>

                    <div className="flex space-x-3">
                        {!isSubmitted ? (
                            <button
                                onClick={handleSubmitSentence}
                                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition duration-200 ease-in-out font-medium shadow-md"
                                disabled={!sentence.trim()}
                            >
                                Submit Sentence
                            </button>
                        ) : (
                            <button
                                onClick={handleNextWord}
                                className="px-6 py-3 bg-info text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out font-medium shadow-md"
                            >
                                Next Word
                            </button>
                        )}
                    </div>
                </div>

                {/* AI FEEDBACK BOX */}
                {isSubmitted && (
                    <div className="mt-6 bg-gray-100 p-6 rounded-xl shadow-md border border-gray-200 w-full">
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                            Level: <span className="font-bold">{level}</span>
                        </p>

                        <p className="text-lg text-gray-700 mb-3">
                            <span className="font-semibold">Suggestion:</span> {suggestion}
                        </p>

                        <p className="text-lg text-gray-700">
                            <span className="font-semibold">Corrected Sentence:</span><br />
                            <span className="italic">{correctedSentence}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
