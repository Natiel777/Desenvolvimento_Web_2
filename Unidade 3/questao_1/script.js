const lista = document.getElementById("lista");
const input = document.getElementById("inputtarefa");

function adicionartarefa() {
  const novatarefa = document.createElement("li");
  novatarefa.textContent = input.value.trim() || "Nova Tarefa";

  const bntremover = document.createElement("button");
  bntremover.textContent = "Remover";
  bntremover.onclick = function() {
    lista.removeChild(novatarefa);
  };

  novatarefa.appendChild(bntremover); 
  lista.appendChild(novatarefa);

  input.value = "";
  input.focus();
}

