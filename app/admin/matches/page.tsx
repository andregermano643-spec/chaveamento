"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../adminGlobal.css";

type Match = {
  id: string;
  phase: string;
  side: string;
  position: number;
  score1: number;
  score2: number;
  team1_id: string;
  team2_id: string;
};

type Team = {
  id: string;
  name: string;
};

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchTeams();
    fetchMatches();
  }, []);

  async function fetchTeams() {
    const { data } = await supabase.from("teams").select("id,name");
    setTeams(data || []);
  }

  async function fetchMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("phase", { ascending: true })
      .order("position", { ascending: true });

    setMatches(data || []);
  }

  function getTeamName(id: string) {
    const team = teams.find((t) => t.id === id);
    return team ? team.name : "Desconhecido";
  }

  async function updateScore(matchId: string, score1: number, score2: number) {
    const { error } = await supabase
      .from("matches")
      .update({ score1, score2 })
      .eq("id", matchId);

    if (error) {
      alert("Erro ao atualizar placar: " + error.message);
      return;
    }

    fetchMatches();
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>CRUD Jogos</h1>
        <a href="/admin" className="admin-back">
          Voltar
        </a>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Jogo</th>
              <th>Placar</th>
              <th>Salvar</th>
            </tr>
          </thead>

          <tbody>
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                team1={getTeamName(match.team1_id)}
                team2={getTeamName(match.team2_id)}
                onSave={updateScore}
              />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function MatchRow({
  match,
  team1,
  team2,
  onSave,
}: {
  match: Match;
  team1: string;
  team2: string;
  onSave: (id: string, s1: number, s2: number) => void;
}) {
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);

  return (
    <tr>
      <td>{match.phase.toUpperCase()}</td>

      <td>
        {team1} x {team2}
      </td>

      <td>
        <input
          type="number"
          value={score1}
          onChange={(e) => setScore1(Number(e.target.value))}
          style={{
            width: "50px",
            marginRight: "10px",
            padding: "6px",
            borderRadius: "6px",
            border: "none",
            background: "#1f2937",
            color: "white",
          }}
        />
        <input
          type="number"
          value={score2}
          onChange={(e) => setScore2(Number(e.target.value))}
          style={{
            width: "50px",
            padding: "6px",
            borderRadius: "6px",
            border: "none",
            background: "#1f2937",
            color: "white",
          }}
        />
      </td>

      <td>
        <button
          className="admin-btn btn-save"
          onClick={() => onSave(match.id, score1, score2)}
        >
          Salvar
        </button>
      </td>
    </tr>
  );
}