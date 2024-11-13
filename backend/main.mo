import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Order "mo:base/Order";

actor {
    // Define the Score type
    public type Score = {
        name: Text;
        score: Nat;
    };

    // Store scores in a stable variable
    private stable var scores : [Score] = [];
    private let MAX_LEADERBOARD_SIZE = 10;

    // Add a new score to the leaderboard
    public shared func addScore(name : Text, score : Nat) : async () {
        let newScore : Score = {
            name = name;
            score = score;
        };

        let scoresBuffer = Buffer.Buffer<Score>(scores.size() + 1);
        
        // Add existing scores to buffer
        for (existingScore in scores.vals()) {
            scoresBuffer.add(existingScore);
        };
        
        // Add new score
        scoresBuffer.add(newScore);

        // Sort scores in descending order
        let sortedScores = Buffer.toArray(scoresBuffer);
        scores := Array.sort<Score>(sortedScores, func(a, b) {
            if (a.score > b.score) { #less }
            else if (a.score < b.score) { #greater }
            else { #equal }
        });

        // Keep only top scores
        if (scores.size() > MAX_LEADERBOARD_SIZE) {
            scores := Array.tabulate<Score>(MAX_LEADERBOARD_SIZE, func(i) {
                scores[i];
            });
        };
    };

    // Get the high scores
    public query func getHighScores() : async [Score] {
        scores
    };
}
