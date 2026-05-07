import tkinter as tk
from tkinter import filedialog, messagebox


class NotepadApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Python 记事本")
        self.root.geometry("800x600")

        self.current_file: str | None = None

        self.text = tk.Text(self.root, wrap="word", undo=True)
        self.text.pack(fill="both", expand=True)

        self._build_menu()

    def _build_menu(self) -> None:
        menubar = tk.Menu(self.root)

        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="新建", command=self.new_file)
        file_menu.add_command(label="打开", command=self.open_file)
        file_menu.add_command(label="保存", command=self.save_file)
        file_menu.add_command(label="另存为", command=self.save_file_as)
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.root.quit)

        menubar.add_cascade(label="文件", menu=file_menu)
        self.root.config(menu=menubar)

    def new_file(self) -> None:
        self.text.delete("1.0", tk.END)
        self.current_file = None
        self.root.title("Python 记事本 - 新文件")

    def open_file(self) -> None:
        file_path = filedialog.askopenfilename(
            title="打开文本文件",
            filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
        )
        if not file_path:
            return

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.text.delete("1.0", tk.END)
            self.text.insert(tk.END, content)
            self.current_file = file_path
            self.root.title(f"Python 记事本 - {file_path}")
        except OSError as exc:
            messagebox.showerror("打开失败", f"无法打开文件：\n{exc}")

    def save_file(self) -> None:
        if self.current_file is None:
            self.save_file_as()
            return

        self._write_to_path(self.current_file)

    def save_file_as(self) -> None:
        file_path = filedialog.asksaveasfilename(
            title="保存文本文件",
            defaultextension=".txt",
            filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
        )
        if not file_path:
            return

        self._write_to_path(file_path)
        self.current_file = file_path
        self.root.title(f"Python 记事本 - {file_path}")

    def _write_to_path(self, path: str) -> None:
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(self.text.get("1.0", tk.END))
            messagebox.showinfo("保存成功", "文件已保存。")
        except OSError as exc:
            messagebox.showerror("保存失败", f"无法保存文件：\n{exc}")


def main() -> None:
    root = tk.Tk()
    NotepadApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
