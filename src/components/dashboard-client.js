"use client";

import { Children, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

const buildPostText = (post) => {
  const lines = [];
  if (post.date_human) {
    lines.push(`🗓 ${post.date_human}`);
  }
  if (post.group) {
    lines.push(`📌 ${post.group}`);
  }
  if (post.text) {
    lines.push("", post.text);
  }
  if (post.attachments_view) {
    lines.push("", `Вложения: ${post.attachments_view}`);
  }
  if (post.url) {
    lines.push("", `🔗 ${post.url}`);
  }
  return lines.join("\n");
};

const DashboardClient = ({
  activeTab,
  page,
  totalPages,
  totalPosts,
  totalSchedule,
  totalGroups,
  posts,
  scheduleTimes,
  groups,
  groupQuery,
}) => {
  const [confirmState, setConfirmState] = useState({ type: "", value: "" });
  const router = useRouter();
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState("");

  const titleSummary = useMemo(() => {
    if (activeTab === "posts") {
      return `Всего постов: ${totalPosts}${totalPosts > 0 ? ` | Страница ${page} из ${totalPages}` : ""}`;
    }
    if (activeTab === "schedule") {
      return `Всего таймингов: ${totalSchedule}`;
    }
    return `Всего сообществ: ${totalGroups}`;
  }, [activeTab, page, totalGroups, totalPages, totalPosts, totalSchedule]);

  const onCopyClick = async (post) => {
    try {
      await navigator.clipboard.writeText(buildPostText(post));
    } catch {
      window.alert("Не удалось скопировать текст");
    }
  };

  const onDeleteConfirm = async () => {
    const { type, value } = confirmState;
    if (!type || !value) {
      return;
    }

    if (type === "post") {
      await fetch(`/api/delete/${encodeURIComponent(value)}`, { method: "POST" });
    } else if (type === "schedule") {
      const formData = new FormData();
      formData.append("time", value);
      await fetch("/api/schedule/delete", { method: "POST", body: formData });
    } else if (type === "group") {
      const formData = new FormData();
      formData.append("group_id", value);
      await fetch("/api/groups/delete", { method: "POST", body: formData });
    }

    window.location.reload();
  };

  const onGroupAdd = async () => {
    const digitsOnly = groupId.replace(/\D/g, "");
    if (!digitsOnly) {
      setGroupError("ID сообщества не может быть пустым");
      return;
    }

    const formData = new FormData();
    formData.append("group_id", `-${digitsOnly}`);
    formData.append("group_name", groupName.trim());

    const response = await fetch("/api/groups/add", { method: "POST", body: formData });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setGroupError(data?.message || "Ошибка при добавлении сообщества");
      return;
    }

    setIsGroupDialogOpen(false);
    window.location.href = "/?tab=groups";
  };

  return (
    <Stack spacing={2} maxWidth={980} margin="0 auto" padding={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h4">МОЯ ЛЕНТА</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{titleSummary}</Typography>
          <Button component={Link} href={`/?tab=${activeTab}`} variant="contained" size="small" startIcon={<RefreshIcon />}>
            Обновить
          </Button>
          <Button component={Link} href="/api/logout" variant="outlined" size="small" color="error" startIcon={<LogoutIcon />}>
            Выйти
          </Button>
        </Stack>
      </Stack>

      <Tabs value={activeTab} variant="fullWidth">
        {Children.toArray([
          <Tab value="posts" label="Посты" component={Link} href="/?tab=posts" />,
          <Tab value="schedule" label="Расписание" component={Link} href="/?tab=schedule" />,
          <Tab value="groups" label="Сообщества" component={Link} href="/?tab=groups" />,
        ])}
      </Tabs>

      {activeTab === "posts" && totalPages > 1 ? (
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_event, value) => {
            router.push(`/?tab=posts&page=${value}`);
          }}
        />
      ) : null}

      {activeTab === "posts" ? (
        posts.length ? (
          <Stack spacing={2}>
            {Children.toArray(
              posts.map((post) => (
                <Card>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{post.group}</Typography>
                        <Typography variant="body2">{post.date_human}</Typography>
                      </Stack>
                      <Typography whiteSpace="pre-line">{post.text || "Без текста"}</Typography>
                      {post.postImages?.length ? (
                        <Stack spacing={1}>
                          {Children.toArray(
                            post.postImages.map((imageName) => (
                              <img src={`/api/images/${imageName}`} alt="Изображение поста" style={{ maxHeight: 300, borderRadius: 8, objectFit: "cover" }} />
                            )),
                          )}
                        </Stack>
                      ) : null}
                      {post.attachments_view ? <Typography variant="body2">Вложения: {post.attachments_view}</Typography> : null}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Button href={post.url} target="_blank" variant="text">
                          Открыть
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Button onClick={() => onCopyClick(post)} variant="contained" color="success" startIcon={<ContentCopyIcon />}>
                            Копировать
                          </Button>
                          <Button onClick={() => setConfirmState({ type: "post", value: post.id })} variant="contained" color="error" startIcon={<DeleteIcon />}>
                            Удалить
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )),
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary" textAlign="center">
            Постов нет
          </Typography>
        )
      ) : null}

      {activeTab === "schedule" ? (
        <Stack spacing={2} maxWidth={520} alignSelf="center" width="100%">
          <form action="/api/schedule/add" method="post">
            <Stack direction="row" spacing={1}>
              <TextField type="time" name="time" required fullWidth size="small" />
              <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                Добавить
              </Button>
            </Stack>
          </form>
          {scheduleTimes.length ? (
            <List>
              {Children.toArray(
                scheduleTimes.map((timeValue) => (
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => setConfirmState({ type: "schedule", value: timeValue })}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Typography>{timeValue}</Typography>
                  </ListItem>
                )),
              )}
            </List>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Таймингов нет
            </Typography>
          )}
        </Stack>
      ) : null}

      {activeTab === "groups" ? (
        <Stack spacing={2} maxWidth={720} alignSelf="center" width="100%">
          <form action="/" method="get">
            <input type="hidden" name="tab" value="groups" />
            <Stack direction="row" spacing={1}>
              <TextField name="group_query" defaultValue={groupQuery} placeholder="Поиск по названию или ID" size="small" fullWidth />
              <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
                Искать
              </Button>
              <Button type="button" variant="outlined" onClick={() => setIsGroupDialogOpen(true)} startIcon={<AddIcon />}>
                Добавить
              </Button>
            </Stack>
          </form>
          {groups.length ? (
            <List>
              {Children.toArray(
                groups.map((group) => (
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => setConfirmState({ type: "group", value: group.id })}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Stack direction="row" spacing={1}>
                      <Typography>{group.name}</Typography>
                      <Typography color="text.secondary">ID: {group.id}</Typography>
                    </Stack>
                  </ListItem>
                )),
              )}
            </List>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Сообществ нет
            </Typography>
          )}
        </Stack>
      ) : null}

      <Dialog open={Boolean(confirmState.type)} onClose={() => setConfirmState({ type: "", value: "" })}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmState({ type: "", value: "" })}>
            Отмена
          </Button>
          <Button color="error" variant="contained" onClick={onDeleteConfirm}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onClose={() => setIsGroupDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Добавить сообщество</DialogTitle>
        <DialogContent>
          <Stack spacing={2} paddingTop={1}>
            <TextField
              label="ID сообщества"
              value={groupId}
              onChange={(event) => setGroupId(event.target.value.replace(/\D/g, ""))}
              fullWidth
            />
            <TextField label="Название (необязательно)" value={groupName} onChange={(event) => setGroupName(event.target.value)} fullWidth />
            {groupError ? <Alert severity="error">{groupError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setIsGroupDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={onGroupAdd}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DashboardClient;
