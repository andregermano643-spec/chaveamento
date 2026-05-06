"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./bracket.css";

type Team = {
  id: string;
  name: string;
  logo_url: string;
};

type Match = {
  id: string;
  score1: number;
  score2: number;
  side: string;
  position: number;
  phase: string;
  team1: Team;
  team2: Team;
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        phase,
        score1,
        score2,
        side,
        position,
        team1:team1_id(id,name,logo_url),
        team2:team2_id(id,name,logo_url)
      `)
      .in("phase", ["quartas", "semi", "final"])
      .order("phase", { ascending: true })
      .order("position", { ascending: true });

    if (error) {
      console.log("Erro ao buscar jogos:", error.message);
      return;
    }

    if (data) setMatches(data as any);
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const quartasLeft = matches.filter(
    (m) => m.phase === "quartas" && m.side === "left"
  );

  const quartasRight = matches.filter(
    (m) => m.phase === "quartas" && m.side === "right"
  );

  const semiLeft = matches.filter(
    (m) => m.phase === "semi" && m.side === "left"
  );

  const semiRight = matches.filter(
    (m) => m.phase === "semi" && m.side === "right"
  );

  const finalMatch = matches.find((m) => m.phase === "final");

  let champion: Team | null = null;

  if (finalMatch) {
    if (finalMatch.score1 > finalMatch.score2) champion = finalMatch.team1;
    if (finalMatch.score2 > finalMatch.score1) champion = finalMatch.team2;
  }

  return (
    <main className="bracket-container">
      <div className="background-overlay"></div>

      <section className="home-hero">
        <h1 className="title">MUNDIAL DE CLUBES</h1>

        <div className="hero-image">
          <img
            src="/images/mundial-trofeu.png"
            alt="Troféu Mundial de Clubes"
          />
        </div>
      </section>

      <div className="bracket-full">
        <div className="col">
          <h2 className="round-title">QUARTAS</h2>

          <div className="side">
            {quartasLeft.map((match) => (
              <MatchBox key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="col semi-col">
          <h2 className="round-title">SEMI</h2>

          <div className="semi">
            {semiLeft.map((match) => (
              <MatchBox key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="col final-col">
          <h2 className="round-title">FINAL</h2>

          {finalMatch ? (
            <>
              <MatchBox match={finalMatch} highlight />

              {champion && (
                <div className="champion-box">
                  <p className="champion-title">🏆 CAMPEÃO</p>

                  <div className="champion-team">
                    <img src={champion.logo_url} alt={champion.name} />
                    <span>{champion.name}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="final-box">
              <span className="trophy">🏆</span>
              <p className="final-text">Final ainda não gerada</p>
            </div>
          )}
        </div>

        <div className="col semi-col">
          <h2 className="round-title">SEMI</h2>

          <div className="semi">
            {semiRight.map((match) => (
              <MatchBox key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="col">
          <h2 className="round-title">QUARTAS</h2>

          <div className="side">
            {quartasRight.map((match) => (
              <MatchBox key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function MatchBox({
  match,
  highlight = false,
}: {
  match: Match;
  highlight?: boolean;
}) {
  return (
    <div className={`match-box ${highlight ? "match-box-final" : ""}`}>
      <TeamRow team={match.team1} score={match.score1} />
      <TeamRow team={match.team2} score={match.score2} />
    </div>
  );
}

function TeamRow({ team, score }: { team: Team; score: number }) {
  return (
    <div className="team-row">
      <div className="team-info">
        <img src={team.logo_url} alt={team.name} />
        <span>{team.name}</span>
      </div>

      <div className="score">{score}</div>
    </div>
  );
}






