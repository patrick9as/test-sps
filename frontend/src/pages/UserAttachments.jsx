import React, { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Grid from "../components/Grid";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
import AttachmentService from "../services/AttachmentService";

const pageStyle = {
  padding: "0.5rem 0",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
};

const titleStyle = { margin: 0 };
const subtitleStyle = { margin: "0.35rem 0 0 0", color: "#666" };
const linkStyle = { color: "#2f73b2", textDecoration: "none", fontSize: "0.9rem" };

const buttonPrimaryStyle = {
  padding: "0.7rem 1.25rem",
  backgroundColor: "#2f73b2",
  color: "#fff",
  border: "none",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.95rem",
};

const buttonSecondaryStyle = {
  padding: "0.65rem 1rem",
  backgroundColor: "transparent",
  color: "#555",
  border: "1px solid #ccc",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.95rem",
};

const dangerButtonStyle = {
  ...buttonSecondaryStyle,
  color: "#c00",
  borderColor: "#e0b4b4",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem 0.9rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontFamily: "inherit",
  fontSize: "1rem",
  boxSizing: "border-box",
};

function formatSize(size) {
  if (!Number.isFinite(size)) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function UserAttachments() {
  const { user } = useLoaderData();
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentToRename, setAttachmentToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const canEdit = authUser?.id === userId;
  const titleName = user?.name || t("attachments.pageTitle");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorKey(null);

    AttachmentService.list(userId)
      .then((response) => {
        if (!cancelled) {
          setAttachments(response.data.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorKey(err.response?.data?.error || "internal.server_error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const selectedFilesLabel = useMemo(() => {
    if (!selectedFiles.length) return null;
    return t("attachments.selectedCount", { count: selectedFiles.length });
  }, [selectedFiles, t]);

  if (user === null) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>{t("attachments.pageTitle")}</h1>
        <p style={{ color: "#c00" }}>{t("users.not_found")}</p>
        <Link to="/users" style={linkStyle}>
          ← {t("users.pageTitle")}
        </Link>
      </div>
    );
  }

  const getErrorMessage = (err) => {
    const key = err.response?.data?.error;
    return key ? t(key) : t("internal.server_error");
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      toast.error(t("validation.invalid_body"));
      return;
    }

    try {
      setIsUploading(true);
      const response = await AttachmentService.create(userId, selectedFiles);
      const created = response.data.data || [];
      setAttachments((prev) => [...created, ...prev]);
      setSelectedFiles([]);
      event.target.reset();
      toast.success(t("attachments.uploaded"));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await AttachmentService.download(userId, attachment.id);
      const blobUrl = window.URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = attachment.filename || "attachment";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (!attachmentToRename) return;

    try {
      const response = await AttachmentService.update(attachmentToRename.userId, attachmentToRename.id, {
        filename: renameValue,
      });
      const updated = response.data.data;
      setAttachments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setAttachmentToRename(null);
      setRenameValue("");
      toast.success(t("attachments.updated"));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!attachmentToDelete) return;

    try {
      await AttachmentService.remove(attachmentToDelete.userId, attachmentToDelete.id);
      setAttachments((prev) => prev.filter((item) => item.id !== attachmentToDelete.id));
      setAttachmentToDelete(null);
      toast.success(t("attachments.deleted"));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ ...titleStyle, marginTop: "0.5rem" }}>{t("attachments.pageTitle")}</h1>
          <p style={subtitleStyle}>{t("attachments.pageSubtitle", { name: titleName })}</p>
          {!canEdit && <p style={{ ...subtitleStyle, color: "#2f73b2" }}>{t("attachments.readOnlyHint")}</p>}
        </div>
      </div>

      {canEdit && (
        <Card
          padding={isMobile ? "1rem" : "1.25rem"}
          borderRadius="12px"
          boxShadow="0 1px 4px rgba(0,0,0,0.1)"
          border="1px solid #eee"
          minWidth={undefined}
          style={{ marginBottom: "1rem" }}
        >
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: "0.75rem", fontWeight: 600 }}>{t("attachments.uploadTitle")}</div>
            <input
              type="file"
              className="form-control"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              style={inputStyle}
            />
            {selectedFilesLabel && (
              <p style={{ margin: "0.75rem 0 0 0", color: "#666" }}>{selectedFilesLabel}</p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button type="submit" style={buttonPrimaryStyle} disabled={isUploading}>
                {isUploading ? t("attachments.uploading") : t("attachments.uploadButton")}
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p>{t("attachments.loading")}</p>
      ) : errorKey ? (
        <p style={{ color: "#c00" }}>{t(errorKey)}</p>
      ) : attachments.length === 0 ? (
        <p>{t("attachments.empty")}</p>
      ) : (
        <Grid
          items={attachments}
          renderItem={(attachment) => (
            <Card
              padding="1rem"
              borderRadius="8px"
              boxShadow="0 1px 4px rgba(0,0,0,0.1)"
              border="1px solid #eee"
              minWidth={undefined}
            >
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div>
                  <strong>{attachment.filename}</strong>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {t("attachments.fileType")}: {attachment.mime}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {t("attachments.fileSize")}: {formatSize(attachment.size)}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {t("attachments.createdAt")}: {formatDate(attachment.createdAt)}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {t("attachments.updatedAt")}: {formatDate(attachment.updatedAt)}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    style={buttonSecondaryStyle}
                    onClick={() => handleDownload(attachment)}
                  >
                    {t("attachments.download")}
                  </button>
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        style={buttonSecondaryStyle}
                        onClick={() => {
                          setAttachmentToRename(attachment);
                          setRenameValue(attachment.filename);
                        }}
                      >
                        {t("attachments.rename")}
                      </button>
                      <button
                        type="button"
                        style={dangerButtonStyle}
                        onClick={() => setAttachmentToDelete(attachment)}
                      >
                        {t("attachments.delete")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        />
      )}

      <Modal
        open={!!attachmentToRename}
        onClose={() => {
          setAttachmentToRename(null);
          setRenameValue("");
        }}
        title={t("attachments.renameTitle")}
      >
        <form onSubmit={handleRename}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>{t("attachments.filenameLabel")}</span>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              style={inputStyle}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              type="button"
              style={buttonSecondaryStyle}
              onClick={() => {
                setAttachmentToRename(null);
                setRenameValue("");
              }}
            >
              {t("users.cancel")}
            </button>
            <button type="submit" style={buttonPrimaryStyle}>
              {t("users.save")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!attachmentToDelete}
        onClose={() => setAttachmentToDelete(null)}
        title={t("attachments.deleteConfirmTitle")}
      >
        <p style={{ margin: "0 0 1rem 0" }}>
          {attachmentToDelete
            ? t("attachments.deleteConfirmMessage", { name: attachmentToDelete.filename })
            : ""}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button type="button" style={buttonSecondaryStyle} onClick={() => setAttachmentToDelete(null)}>
            {t("users.cancel")}
          </button>
          <button type="button" style={dangerButtonStyle} onClick={handleDelete}>
            {t("attachments.delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default UserAttachments;
