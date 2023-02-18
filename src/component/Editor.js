import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/matchtags";

function Editor({ socketRef, roomID, onCodeChange }) {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("editor"),
        {
          mode: {
            name: "javascript",
            json: true,
          },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          matchBrackets: true,
          matchTags: true,
        }
      );
      editorRef.current.on("change", (instance, changes) => {
        const code = instance.getValue();
        onCodeChange(code);
        if (changes.origin !== "setValue") {
          socketRef.current.emit("code-change", { code, roomID });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", (data) => {
        if (data.code !== null) {
          editorRef.current.setValue(data.code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  return <textarea id="editor"></textarea>;
}

export default Editor;
