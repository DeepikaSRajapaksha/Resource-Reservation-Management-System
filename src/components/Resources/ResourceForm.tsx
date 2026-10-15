"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/common/ToastProvider";
import styles from "@/styles/Resources/ResourceForm.module.css";

type ResourceFormValues = {
  name: string;
  category: string;
  description: string;
  isActive: boolean;
};

type ResourceResponse = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

type ResourceFormProps = {
  mode: "create" | "edit";
  resourceId?: string;
};

const emptyForm: ResourceFormValues = {
  name: "",
  category: "",
  description: "",
  isActive: true,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export default function ResourceForm({
  mode,
  resourceId,
}: ResourceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit";

  const [form, setForm] =
    useState<ResourceFormValues>(emptyForm);
  const [currentImage, setCurrentImage] =
    useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeCurrentImage, setRemoveCurrentImage] =
    useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!isEdit || !resourceId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadResource() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/resources/${resourceId}`,
          { cache: "no-store" }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message || "Could not load resource."
          );
        }

        const resource = result as ResourceResponse;

        if (!cancelled) {
          setForm({
            name: resource.name ?? "",
            category: resource.category ?? "",
            description: resource.description ?? "",
            isActive: resource.isActive,
          });

          setCurrentImage(resource.image ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load resource.";

          setError(message);
          showToast("error", message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [isEdit, resourceId, showToast]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    setError("");

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      setError("Choose a PNG, JPG, JPEG, or WebP image.");
      showToast("error", "Unsupported image format.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      event.target.value = "";
      setError("Image size must not exceed 5 MB.");
      showToast("error", "Image size must not exceed 5 MB.");
      return;
    }

    setImageFile(file);
    setRemoveCurrentImage(false);
  }

  function cancelNewImage() {
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function removeImage() {
    setImageFile(null);
    setRemoveCurrentImage(true);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    if (isEdit && !resourceId) {
      setError("Missing resource ID.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("category", form.category);
      formData.append("description", form.description.trim());
      formData.append("isActive", String(form.isActive));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (removeCurrentImage && !imageFile) {
        formData.append("removeImage", "true");
      }

      const url = isEdit
        ? `/api/resources/${resourceId}`
        : "/api/resources";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Failed to ${isEdit ? "update" : "create"} resource.`
        );
      }

      showToast(
        "success",
        isEdit
          ? "Resource updated successfully!"
          : "Resource created successfully!"
      );

      router.push("/admin/resources");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading resource details...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{isEdit ? "Edit Resource" : "Create Resource"}</h1>
          <p>
            {isEdit
              ? "Update resource details, image, and availability."
              : "Add a new resource to your resource management system."}
          </p>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <section className={styles.card}>
        <h2>Resource Details</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              Resource Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Meeting Room A"
                maxLength={150}
                required
              />
            </label>

            <label className={styles.field}>
              Category *
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Equipment">Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Software">Software</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div className={`${styles.fullWidth} ${styles.imageStatusRow}`}>
              <label className={styles.field}>
                Resource Image
                <input
                  ref={imageInputRef}
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
                <small>
                  PNG, JPG, JPEG, or WebP. Maximum 5 MB.
                </small>
              </label>

              <label className={styles.field}>
                Status
                <select
                  name="isActive"
                  value={String(form.isActive)}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            {(imagePreview ||
              (currentImage && !removeCurrentImage)) && (
              <div className={`${styles.fullWidth} ${styles.previewSection}`}>
                <p className={styles.previewTitle}>
                  {imagePreview
                    ? "New Image Preview"
                    : "Current Image"}
                </p>

                <img
                  key={imagePreview || currentImage || "resource-image"}
                  src={imagePreview || currentImage || ""}
                  alt="Resource preview"
                  className={styles.imagePreview}
                  onError={(event) => {
                    console.error(
                      "Failed to load resource image:",
                      event.currentTarget.src
                    );
                  }}
                />

                {imagePreview ? (
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={cancelNewImage}
                  >
                    Cancel New Image
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={removeImage}
                  >
                    Remove Current Image
                  </button>
                )}
              </div>
            )}

            {removeCurrentImage && !imagePreview && (
              <div className={`${styles.fullWidth} ${styles.removeNotice}`}>
                <p>The current image will be removed when you save.</p>
                <button
                  type="button"
                  className={styles.keepImageButton}
                  onClick={() => setRemoveCurrentImage(false)}
                >
                  Keep Current Image
                </button>
              </div>
            )}

            <label className={`${styles.field} ${styles.fullWidth}`}>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter resource details"
                rows={4}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Resource"
                  : "Create Resource"}
            </button>

            <Link
              href="/admin/resources"
              className={styles.cancelButton}
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
