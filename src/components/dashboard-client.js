"use client";

import { Children, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AppHeader } from "@/components/app-header";

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

export const DashboardClient = ({
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
  const [previewImages, setPreviewImages] = useState([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

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

  const closePreview = () => {
    setPreviewImages([]);
    setPreviewImageIndex(0);
  };

  const previewImageUrl = previewImages[previewImageIndex] || "";

  const openPreview = (images, index) => {
    setPreviewImages(images);
    setPreviewImageIndex(index);
  };

  const postCards = Children.toArray(
    posts.map((post) => {
      const postImages = Children.toArray(
        (post.postImages || []).map((imageName, imageIndex) => (
          <Box
            key={imageName}
            component="img"
            src={`/api/images/${imageName}`}
            alt="Изображение поста"
            onClick={() => openPreview((post.postImages || []).map((item) => `/api/images/${item}`), imageIndex)}
            sx={{
              width: "auto",
              maxWidth: "100%",
              maxHeight: 320,
              borderRadius: 1,
              objectFit: "contain",
              transform: "scale(1)",
              transformOrigin: "center",
              transition: "transform 0.2s ease-in-out",
              cursor: "zoom-in",
              "&:hover": {
                transform: "scale(1.2)",
              },
            }}
          />
        )),
      );

      return (
        <Card key={post.id}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{post.group}</Typography>
                <Typography variant="body2">{post.date_human}</Typography>
              </Stack>
              <Typography whiteSpace="pre-line">{post.text || "Без текста"}</Typography>
              {postImages.length ? <Stack spacing={1}>{postImages}</Stack> : null}
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
      );
    }),
  );

  const scheduleListItems = Children.toArray(
    scheduleTimes.map((timeValue) => (
      <ListItem key={timeValue}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
          <Typography>{timeValue}</Typography>
          <IconButton edge="end" color="error" onClick={() => setConfirmState({ type: "schedule", value: timeValue })}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </ListItem>
    )),
  );

  const groupListItems = Children.toArray(
    groups.map((group) => (
      <ListItem key={group.id}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
          <Stack direction="row" spacing={1}>
            <Typography>{group.name}</Typography>
            <Typography color="text.secondary">ID: {group.id}</Typography>
          </Stack>
          <IconButton edge="end" color="error" onClick={() => setConfirmState({ type: "group", value: group.id })}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </ListItem>
    )),
  );

  return (
    <Stack spacing={2}>
      <AppHeader activeTab={activeTab} titleSummary={titleSummary} />

      <Stack spacing={2} maxWidth={1160} margin="0 auto" paddingX={2} paddingBottom={2} width="100%" alignSelf="center">
        <Tabs value={activeTab} variant="fullWidth">
          {Children.toArray([
            <Tab key="posts-tab" value="posts" label="Посты" component={Link} href="/?tab=posts" />,
            <Tab key="schedule-tab" value="schedule" label="Расписание" component={Link} href="/?tab=schedule" />,
            <Tab key="groups-tab" value="groups" label="Сообщества" component={Link} href="/?tab=groups" />,
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
            <Stack spacing={2}>{postCards}</Stack>
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
              <List>{scheduleListItems}</List>
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
              <List>{groupListItems}</List>
            ) : (
              <Typography color="text.secondary" textAlign="center">
                Сообществ нет
              </Typography>
            )}
          </Stack>
        ) : null}
      </Stack>

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

      <Dialog
        open={Boolean(previewImageUrl)}
        onClose={closePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Изображения</Typography>
            <IconButton color="error" onClick={closePreview}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ overflow: "hidden", pb: 2 }}>
          <DialogContentText sx={{ mb: 1.5 }}>Нажми вне окна или Esc, чтобы закрыть просмотр.</DialogContentText>
          {previewImageUrl ? (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ minHeight: "70vh", overflow: "hidden" }}>
              <IconButton
                color="primary"
                disabled={previewImages.length <= 1}
                onClick={() => setPreviewImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Box
                component="img"
                src={previewImageUrl}
                alt="Полный размер изображения"
                sx={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 1,
                }}
              />
              <IconButton
                color="primary"
                disabled={previewImages.length <= 1}
                onClick={() => setPreviewImageIndex((prev) => (prev + 1) % previewImages.length)}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
