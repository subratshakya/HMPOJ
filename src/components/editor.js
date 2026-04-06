import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "../CSS/components.css";
import "codemirror/theme/gruvbox-dark.css"; // Import your theme
import "codemirror/mode/clike/clike";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

const Editor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  // Define the init function
  const init = () => {
    editorRef.current = CodeMirror.fromTextArea(
      document.getElementById("editorRef"),
      {
        mode: "text/x-c++src",
        theme: "gruvbox-dark", // or any other dark theme
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    // Set initial value
    if (value) {
      editorRef.current.setValue(value);
    }

    // Bind onChange event handler
    editorRef.current.on("change", () => {
      const newValue = editorRef.current.getValue();
      onChange(newValue);
      //console.log("Code changed:", newValue); // Console log when code changes
    });
  };

  // Call init function only once when the component mounts
  useEffect(() => {
    init();
    // Cleanup function: Destroy the CodeMirror instance when the component unmounts
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }
    };
  }, []); // Empty dependency array ensures that this effect runs only once

  return <textarea id="editorRef"></textarea>;
};

export default Editor;
