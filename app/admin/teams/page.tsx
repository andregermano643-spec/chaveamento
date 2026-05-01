"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../adminGlobal.css";

type Team = {
  id: string;
  name: string;
  logo_url: string;
};

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data, error } = await supabase.from("teams").select("*");

    if (error) {
      alert("Erro ao buscar times: " + error.message);
      return;
    }

    setTeams(data || []);
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Digite o nome do time!");
      return;
    }

    if (!logoUrl.trim()) {
      alert("Digite o link do logo!");
      return;
    }

    const { error } = await supabase.from("teams").insert([
      {
        name,
        logo_url: logoUrl,
      },
    ]);

    if (error) {
      alert("Erro ao cadastrar time: " + error.message);
      return;
    }

    setName("");
    setLogoUrl("");
    fetchTeams();
  }

  async function handleUpdate() {
    if (!editingId) return;

    const { error } = await supabase
      .from("teams")
      .update({ name, logo_url: logoUrl })
      .eq("id", editingId);

    if (error) {
      alert("Erro ao editar time: " + error.message);
      return;
    }

    setEditingId(null);
    setName("");
    setLogoUrl("");
    fetchTeams();
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Tem certeza que deseja excluir esse time?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }

    fetchTeams();
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setName(team.name);
    setLogoUrl(team.logo_url);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setLogoUrl("");
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>CRUD Times</h1>
        <a href="/admin" className="admin-back">
          Voltar
        </a>
      </div>

      <div className="admin-card">
        <div className="admin-form">
          <input
            type="text"
            placeholder="Nome do time"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Logo URL (PNG)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />

          {editingId ? (
            <>
              <button className="admin-btn btn-update" onClick={handleUpdate}>
                Atualizar Time
              </button>

              <button className="admin-btn btn-cancel" onClick={cancelEdit}>
                Cancelar
              </button>
            </>
          ) : (
            <button className="admin-btn btn-save" onClick={handleSave}>
              Cadastrar Time
            </button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>
                  {team.logo_url && (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="logo-preview"
                    />
                  )}
                </td>

                <td>{team.name}</td>

                <td>
                 <div className="admin-actions">
  <button className="action-btn edit-btn" onClick={() => startEdit(team)}>
    Editar
  </button>

  <button className="action-btn delete-btn" onClick={() => handleDelete(team.id)}>
    Excluir
  </button>
</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}