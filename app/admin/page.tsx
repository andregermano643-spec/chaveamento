"use client";

import { supabase } from "@/lib/supabaseClient";
import "./adminGlobal.css";

export default function AdminHome() {
  async function gerarQuartas() {
    const { data: teams, error } = await supabase.from("teams").select("*");

    if (error) {
      alert("Erro ao buscar times: " + error.message);
      return;
    }

    if (!teams || teams.length !== 8) {
      alert("Você precisa ter exatamente 8 times cadastrados!");
      return;
    }

    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    const jogos = [
      {
        phase: "quartas",
        side: "left",
        position: 1,
        team1_id: shuffled[0].id,
        team2_id: shuffled[1].id,
        score1: 0,
        score2: 0,
      },
      {
        phase: "quartas",
        side: "left",
        position: 2,
        team1_id: shuffled[2].id,
        team2_id: shuffled[3].id,
        score1: 0,
        score2: 0,
      },
      {
        phase: "quartas",
        side: "right",
        position: 1,
        team1_id: shuffled[4].id,
        team2_id: shuffled[5].id,
        score1: 0,
        score2: 0,
      },
      {
        phase: "quartas",
        side: "right",
        position: 2,
        team1_id: shuffled[6].id,
        team2_id: shuffled[7].id,
        score1: 0,
        score2: 0,
      },
    ];

    await supabase.from("matches").delete().eq("phase", "quartas");
    await supabase.from("matches").delete().eq("phase", "semi");
    await supabase.from("matches").delete().eq("phase", "final");

    const { error: insertError } = await supabase.from("matches").insert(jogos);

    if (insertError) {
      alert("Erro ao gerar jogos: " + insertError.message);
      return;
    }

    alert("Quartas geradas com sucesso!");
  }

  function getWinner(match: any) {
    if (match.score1 > match.score2) return match.team1_id;
    if (match.score2 > match.score1) return match.team2_id;
    return null;
  }

  async function gerarSemifinais() {
    const { data: quartas, error } = await supabase
      .from("matches")
      .select("*")
      .eq("phase", "quartas");

    if (error) {
      alert("Erro ao buscar quartas: " + error.message);
      return;
    }

    if (!quartas || quartas.length !== 4) {
      alert("Precisa ter exatamente 4 jogos nas quartas.");
      return;
    }

    const leftGames = quartas
      .filter((m) => m.side === "left")
      .sort((a, b) => a.position - b.position);

    const rightGames = quartas
      .filter((m) => m.side === "right")
      .sort((a, b) => a.position - b.position);

    const leftWinner1 = getWinner(leftGames[0]);
    const leftWinner2 = getWinner(leftGames[1]);

    const rightWinner1 = getWinner(rightGames[0]);
    const rightWinner2 = getWinner(rightGames[1]);

    if (!leftWinner1 || !leftWinner2 || !rightWinner1 || !rightWinner2) {
      alert("Ainda existe jogo empatado ou sem resultado definido nas quartas.");
      return;
    }

    await supabase.from("matches").delete().eq("phase", "semi");
    await supabase.from("matches").delete().eq("phase", "final");

    const semis = [
      {
        phase: "semi",
        side: "left",
        position: 1,
        team1_id: leftWinner1,
        team2_id: leftWinner2,
        score1: 0,
        score2: 0,
      },
      {
        phase: "semi",
        side: "right",
        position: 1,
        team1_id: rightWinner1,
        team2_id: rightWinner2,
        score1: 0,
        score2: 0,
      },
    ];

    const { error: insertError } = await supabase.from("matches").insert(semis);

    if (insertError) {
      alert("Erro ao gerar semifinais: " + insertError.message);
      return;
    }

    alert("Semifinais geradas com sucesso!");
  }

  async function gerarFinal() {
    const { data: semis, error } = await supabase
      .from("matches")
      .select("*")
      .eq("phase", "semi");

    if (error) {
      alert("Erro ao buscar semifinais: " + error.message);
      return;
    }

    if (!semis || semis.length !== 2) {
      alert("Precisa ter exatamente 2 jogos nas semifinais.");
      return;
    }

    const leftSemi = semis.find((m) => m.side === "left");
    const rightSemi = semis.find((m) => m.side === "right");

    const winnerLeft = getWinner(leftSemi);
    const winnerRight = getWinner(rightSemi);

    if (!winnerLeft || !winnerRight) {
      alert("Ainda existe jogo empatado ou sem resultado definido na semifinal.");
      return;
    }

    await supabase.from("matches").delete().eq("phase", "final");

    const finalMatch = [
      {
        phase: "final",
        side: "center",
        position: 1,
        team1_id: winnerLeft,
        team2_id: winnerRight,
        score1: 0,
        score2: 0,
      },
    ];

    const { error: insertError } = await supabase
      .from("matches")
      .insert(finalMatch);

    if (insertError) {
      alert("Erro ao gerar final: " + insertError.message);
      return;
    }

    alert("Final gerada com sucesso!");
  }
  async function simularFase(phase: string) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("phase", phase);

  if (error) {
    alert("Erro ao buscar jogos: " + error.message);
    return;
  }

  if (!matches || matches.length === 0) {
    alert("Nenhum jogo nessa fase.");
    return;
  }

  const updates = matches.map((match) => {
    let score1 = Math.floor(Math.random() * 6);
    let score2 = Math.floor(Math.random() * 6);

    // ❗ SEM EMPATE
    if (score1 === score2) {
      Math.random() < 0.5 ? score1++ : score2++;
    }

    return {
      id: match.id,
      score1,
      score2,
    };
  });

  for (const update of updates) {
    await supabase
      .from("matches")
      .update({
        score1: update.score1,
        score2: update.score2,
      })
      .eq("id", update.id);
  }

  alert(`Fase ${phase} simulada com sucesso!`);
}

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>Painel Admin</h1>
        <p className="admin-subtitle">Controle do Mundial de Clubes</p>
      </div>

      <div className="admin-card">

  {/* 🟦 QUARTAS */}
  <button onClick={gerarQuartas} className="admin-btn btn-blue">
    Gerar Quartas (Sorteio)
  </button>

  <button
    onClick={() => simularFase("quartas")}
    className="admin-btn btn-blue"
  >
    🎲 Simular Quartas
  </button>

  {/* 🟪 SEMIFINAL */}
  <button onClick={gerarSemifinais} className="admin-btn btn-purple">
    Gerar Semifinais
  </button>

  <button
    onClick={() => simularFase("semi")}
    className="admin-btn btn-purple"
  >
    🎲 Simular Semifinal
  </button>

  {/* 🟨 FINAL */}
  <button onClick={gerarFinal} className="admin-btn btn-yellow">
    Gerar Final
  </button>

  <button
    onClick={() => simularFase("final")}
    className="admin-btn btn-yellow"
  >
    🎲 Simular Final
  </button>

  {/* OUTROS */}
  <a href="/admin/teams" className="admin-btn btn-green">
    CRUD Times
  </a>

  <a href="/admin/matches" className="admin-btn btn-gray">
    CRUD Jogos / Resultados
  </a>

</div>
    </main>
  );
}