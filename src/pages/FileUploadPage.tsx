import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { Upload, File as FileIcon, Clock, HardDrive } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const FileUploadPage = () => {

  const { files, addFiles } = useAppState();
  const [dragging, setDragging] = useState(false);

  // Priority detection
  const getPriority = (name: string) => {

    const lower = name.toLowerCase();

    if (
      lower.includes("medical") ||
      lower.includes("id") ||
      lower.includes("emergency") ||
      lower.includes("patient")
    ) return "HIGH";

    if (
      lower.includes("report") ||
      lower.includes("document")
    ) return "MEDIUM";

    return "LOW";
  };

  // Upload single file
  const uploadFile = async (file: File) => {

    try {

      const fileName = `${Date.now()}-${file.name}`;

      console.log("Uploading:", fileName);

      // STORAGE UPLOAD
      const { data, error } = await supabase.storage
        .from("files")   // bucket name
        .upload(fileName, file);

      console.log("UPLOAD DATA:", data);
      console.log("UPLOAD ERROR:", error);

      if (error) {

        alert("Storage Upload Failed: " + error.message);
        return false;

      }

      // DATABASE INSERT
      const { error: dbError } = await supabase
        .from("files")
        .insert({
          name: file.name,
          size: file.size,
          type: file.type,
          priority: getPriority(file.name),
          created_at: new Date().toISOString()
        });

      console.log("DB INSERT ERROR:", dbError);

      if (dbError) {

        alert("Database Insert Failed: " + dbError.message);
        return false;

      }

      console.log("Upload successful:", file.name);

      return true;

    } catch (err) {

      console.error("Unexpected error:", err);
      alert("Unexpected Upload Error");

      return false;
    }
  };

  // Upload multiple files
const uploadFilesToSupabase = async (fileList: File[]) => {

  let successCount = 0;

  for (const file of fileList) {

    const success = await uploadFile(file);

    if (success) successCount++;

  }

  console.log(`${successCount} files uploaded successfully`);

};

  // Drag Drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {

    e.preventDefault();
    setDragging(false);

    const filesArray = Array.from(e.dataTransfer.files);

    await uploadFilesToSupabase(filesArray);

    addFiles(filesArray);

  }, [addFiles]);

  // File Select
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);

    await uploadFilesToSupabase(filesArray);

    addFiles(filesArray);

  };

  const formatSize = (b: number) =>
    b < 1024
      ? b + " B"
      : b < 1048576
      ? (b / 1024).toFixed(1) + " KB"
      : (b / 1048576).toFixed(1) + " MB";

  const priorityBadge = (p: string) => {

    const cls =
      p === "HIGH"
        ? "bg-danger/20 text-danger"
        : p === "MEDIUM"
        ? "bg-warning/20 text-warning"
        : "bg-success/20 text-success";

    return (

      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${cls}`}
      >

        {p === "HIGH"
          ? "🔴"
          : p === "MEDIUM"
          ? "🟡"
          : "🟢"} {p}

      </span>

    );
  };

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-foreground">
        File Upload
      </h1>

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`glass-card rounded-xl p-10 text-center border-2 border-dashed transition-colors cursor-pointer ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border"
        }`}
      >

        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-input"
        />

        <label
          htmlFor="file-input"
          className="cursor-pointer"
        >

          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />

          <p className="text-foreground font-medium">
            Drop files here or click to upload
          </p>

          <p className="text-muted-foreground text-sm mt-1">
            Files are auto-classified by the AI engine
          </p>

        </label>

      </motion.div>

      {files.length > 0 && (

        <div className="glass-card rounded-xl overflow-hidden">

          <div className="p-4 border-b border-border">

            <h3 className="font-semibold text-foreground">
              {files.length} Files Uploaded
            </h3>

          </div>

          <div className="divide-y divide-border max-h-96 overflow-y-auto">

            <AnimatePresence>

              {files.map((f, i) => (

                <motion.div
                  key={f.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <FileIcon className="h-4 w-4 text-primary shrink-0" />

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-foreground truncate">
                        {f.name}
                      </p>

                      <p className="text-xs text-muted-foreground flex items-center gap-2">

                        <HardDrive className="h-3 w-3" />

                        {formatSize(f.size)} · {f.type}

                        <Clock className="h-3 w-3 ml-1" />

                        {f.uploadTime?.toLocaleTimeString?.() || "Just now"}

                      </p>

                    </div>

                  </div>

                  {priorityBadge(f.priority)}

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

        </div>

      )}

    </div>

  );
};

export default FileUploadPage;