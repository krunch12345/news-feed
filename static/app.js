const buildPostText = (group, date, text, url, attachments) => {
  const lines = [];

  if (date) {
    lines.push(`🗓 ${date}`);
  }

  if (group) {
    lines.push(`📌 ${group}`);
  }

  if (text) {
    lines.push("");
    lines.push(text);
  }

  if (attachments) {
    lines.push("");
    lines.push(`Вложения: ${attachments}`);
  }

  if (url) {
    lines.push("");
    lines.push(`🔗 ${url}`);
  }

  return lines.join("\n");
};


const handleCopyClick = (button) => {
  const group = button.dataset.group || "";
  const date = button.dataset.date || "";
  const text = (button.dataset.text || "").replace(/\\n/g, "\n");
  const url = button.dataset.url || "";
  const attachments = button.dataset.attachments || "";

  const fullText = buildPostText(group, date, text, url, attachments);

  navigator.clipboard.writeText(fullText).catch(() => {
    window.alert("Не удалось скопировать текст");
  });
};


let pendingDeleteId = null;
let pendingDeleteButton = null;
let pendingScheduleTime = null;
let pendingGroupId = null;
let pendingGroupName = null;
let groupAddModalInstance = null;

const frontendAuthFromQuery = new URLSearchParams(window.location.search).get(
  "frontend_auth"
);


const performDelete = () => {
  if (!pendingDeleteId || !pendingDeleteButton) {
    return;
  }

  fetch(`/delete/${encodeURIComponent(pendingDeleteId)}`, {
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      window.location.reload();
    })
    .catch(() => {
      window.alert("Ошибка при удалении поста");
    })
    .finally(() => {
      pendingDeleteId = null;
      pendingDeleteButton = null;
    });
};


const performGroupDelete = () => {
  if (!pendingGroupId) {
    return;
  }

  const formData = new FormData();
  formData.append("group_id", pendingGroupId);

  fetch("/groups/delete", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      window.location.reload();
    })
    .catch(() => {
      window.alert("Ошибка при удалении сообщества");
    })
    .finally(() => {
      pendingGroupId = null;
      pendingGroupName = null;
    });
};


const performScheduleDelete = () => {
  if (!pendingScheduleTime) {
    return;
  }

  const formData = new FormData();
  formData.append("time", pendingScheduleTime);

  fetch("/schedule/delete", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      window.location.reload();
    })
    .catch(() => {
      window.alert("Ошибка при удалении тайминга");
    })
    .finally(() => {
      pendingScheduleTime = null;
    });
};


const handleDeleteClick = (button) => {
  const postId = button.dataset.postId;
  if (!postId) {
    return;
  }

  pendingDeleteId = postId;
  pendingDeleteButton = button;

  const modalElement = document.getElementById("deleteConfirmModal");
  if (!modalElement) {
    performDelete();
    return;
  }

  const textElement = document.getElementById("deleteModalText");
  if (textElement) {
    textElement.textContent = "Вы уверены, что хотите удалить пост?";
  }

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
};


const handleScheduleDeleteClick = (button) => {
  const timeValue = button.dataset.time;
  if (!timeValue) {
    return;
  }

  pendingScheduleTime = timeValue;

  const modalElement = document.getElementById("deleteConfirmModal");
  if (!modalElement) {
    performScheduleDelete();
    return;
  }

  const textElement = document.getElementById("deleteModalText");
  if (textElement) {
    textElement.textContent = "Вы уверены, что хотите удалить тайминг?";
  }

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
};


const handleGroupDeleteClick = (button) => {
  const groupId = button.dataset.groupId;
  const groupName = button.dataset.groupName || "";
  if (!groupId) {
    return;
  }

  pendingGroupId = groupId;
  pendingGroupName = groupName;

  const modalElement = document.getElementById("deleteConfirmModal");
  if (!modalElement) {
    performGroupDelete();
    return;
  }

  const textElement = document.getElementById("deleteModalText");
  if (textElement) {
    textElement.textContent = "Вы уверены, что хотите удалить сообщество?";
  }

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
};


const initHandlers = () => {
  document.querySelectorAll("[data-copy='true']").forEach((button) => {
    button.addEventListener("click", () => handleCopyClick(button));
  });

  document.querySelectorAll("[data-delete='true']").forEach((button) => {
    button.addEventListener("click", () => handleDeleteClick(button));
  });

  document.querySelectorAll("[data-schedule-delete='true']").forEach((button) => {
    button.addEventListener("click", () => handleScheduleDeleteClick(button));
  });

  document.querySelectorAll("[data-group-delete='true']").forEach((button) => {
    button.addEventListener("click", () => handleGroupDeleteClick(button));
  });

  const groupAddButton = document.querySelector("[data-group-add='true']");
  const groupAddModalElement = document.getElementById("groupAddModal");
  const groupAddIdInput = document.getElementById("groupAddId");
  const groupAddNameInput = document.getElementById("groupAddName");
  const groupAddError = document.getElementById("groupAddError");
  const groupAddCancelButton = document.getElementById("groupAddCancelButton");
  const groupAddConfirmButton = document.getElementById("groupAddConfirmButton");

  if (groupAddModalElement) {
    groupAddModalInstance = new bootstrap.Modal(groupAddModalElement);
  }

  const resetGroupAddForm = () => {
    if (groupAddIdInput) {
      groupAddIdInput.value = "";
    }
    if (groupAddNameInput) {
      groupAddNameInput.value = "";
    }
    if (groupAddError) {
      groupAddError.textContent = "";
      groupAddError.classList.add("d-none");
    }
  };

  if (groupAddButton && groupAddModalInstance) {
    groupAddButton.addEventListener("click", () => {
      resetGroupAddForm();
      groupAddModalInstance.show();
    });
  }

  if (groupAddIdInput) {
    groupAddIdInput.addEventListener("input", () => {
      const digitsOnly = (groupAddIdInput.value || "").replace(/\D/g, "");
      groupAddIdInput.value = digitsOnly;
    });
  }

  if (groupAddCancelButton && groupAddModalInstance) {
    groupAddCancelButton.addEventListener("click", () => {
      resetGroupAddForm();
      groupAddModalInstance.hide();
    });
  }

  if (groupAddConfirmButton && groupAddIdInput) {
    groupAddConfirmButton.addEventListener("click", () => {
      const rawIdValue = (groupAddIdInput.value || "").trim();
      const nameValue = (groupAddNameInput ? groupAddNameInput.value : "").trim();

      const digitsOnly = rawIdValue.replace(/\D/g, "");

      if (!digitsOnly) {
        if (groupAddError) {
          groupAddError.textContent = "ID сообщества не может быть пустым";
          groupAddError.classList.remove("d-none");
        }
        return;
      }

      const idValue = `-${digitsOnly}`;

      const formData = new FormData();
      formData.append("group_id", idValue);
      formData.append("group_name", nameValue);

      fetch("/groups/add", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          if (!response.ok) {
            let message = "Ошибка при добавлении сообщества";
            try {
              const data = await response.json();
              if (data && data.message) {
                message = data.message;
              }
            } catch {
              // ignore parse error
            }
            throw new Error(message);
          }
          return response.json();
        })
        .then(() => {
          resetGroupAddForm();
          if (groupAddModalInstance) {
            groupAddModalInstance.hide();
          }
          const tokenParam = frontendAuthFromQuery
            ? `&frontend_auth=${encodeURIComponent(frontendAuthFromQuery)}`
            : "";
          window.location.href = `/?tab=groups${tokenParam}`;
        })
        .catch((error) => {
          if (groupAddError) {
            groupAddError.textContent = error.message || "Ошибка при добавлении сообщества";
            groupAddError.classList.remove("d-none");
          } else {
            window.alert(error.message || "Ошибка при добавлении сообщества");
          }
        });
    });
  }

  const cancelButton = document.getElementById("deleteCancelButton");
  const confirmButton = document.getElementById("deleteConfirmButton");
  const modalElement = document.getElementById("deleteConfirmModal");

  if (cancelButton && modalElement) {
    cancelButton.addEventListener("click", () => {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      pendingDeleteId = null;
      pendingDeleteButton = null;
      pendingScheduleTime = null;
      pendingGroupId = null;
      pendingGroupName = null;
    });
  }

  if (confirmButton && modalElement) {
    confirmButton.addEventListener("click", () => {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      if (pendingScheduleTime) {
        performScheduleDelete();
      } else if (pendingGroupId) {
        performGroupDelete();
      } else {
        performDelete();
      }
    });
  }

  const scrollTopContainer = document.getElementById("scrollTopContainer");
  const updateScrollTopVisibility = () => {
    if (!scrollTopContainer) {
      return;
    }
    const doc = document.documentElement;
    const hasScroll = doc.scrollHeight - doc.clientHeight > 10;
    if (hasScroll) {
      scrollTopContainer.classList.remove("d-none");
    } else {
      scrollTopContainer.classList.add("d-none");
    }
  };

  updateScrollTopVisibility();
  window.addEventListener("resize", updateScrollTopVisibility);
  window.addEventListener("scroll", updateScrollTopVisibility);
};


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initHandlers();
  });
} else {
  initHandlers();
}

