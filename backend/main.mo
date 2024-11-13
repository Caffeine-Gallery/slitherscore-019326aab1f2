import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Order "mo:base/Order";

actor {
    public type Score = {
        name: Text;
        score: Nat;
    };

    private stable var scores : [Score] = [];
    private let MAX_LEADERBOARD_SIZE = 10;

    public shared func addScore(name : Text, score : Nat) : async () {
        let newScore : Score = {
            name = name;
            score = score;
        };

        let scoresBuffer = Buffer.Buffer<Score>(scores.size() + 1);
        
        for (existingScore in scores.vals()) {
            scoresBuffer.add(existingScore);
        };
        
        scoresBuffer.add(newScore);

        let sortedScores = Buffer.toArray(scoresBuffer);
        scores := Array.sort<Score>(sortedScores, func(a, b) {
            if (a.score > b.score) { #less }
            else if (a.score < b.score) { #greater }
            else { #equal }
        });

        if (scores.size() > MAX_LEADERBOARD_SIZE) {
            scores := Array.tabulate<Score>(MAX_LEADERBOARD_SIZE, func(i) {
                scores[i];
            });
        };
    };

    public query func getHighScores() : async [Score] {
        scores
    };
}
