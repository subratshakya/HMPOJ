import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import Footer from "../components/footer";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const ProblemForm = () => {
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [problemType, setProblemType] = useState("");
  const [inputTestcases, setInputTestcases] = useState([]);
  const [outputTestcases, setOutputTestcases] = useState([]);
  const [testcaseInput, setTestcaseInput] = useState("");
  const [testcaseOutput, setTestcaseOutput] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const nav = useNavigate();
  const handleDescriptionChange = (content) => {
    setDescription(content);
  };
  const handleInputChange = (content) => {
    setInput(content);
  };
  const handleOutputChange = (content) => {
    setOutput(content);
  };
  const handleTestcaseInputChange = (event) => {
    setTestcaseInput(event.target.value);
  };

  const handleTestcaseOutputChange = (event) => {
    setTestcaseOutput(event.target.value);
  };

  const handleSampleInputChange = (event) => {
    setSampleInput(event.target.value);
  };

  const handleSampleOutputChange = (event) => {
    setSampleOutput(event.target.value);
  };

  const handleAddTestcase = () => {
    setInputTestcases([...inputTestcases, testcaseInput]);
    setOutputTestcases([...outputTestcases, testcaseOutput]);
    setTestcaseInput("");
    setTestcaseOutput("");
  };

  const handleRemoveTestcase = (index) => {
    setInputTestcases(inputTestcases.filter((_, i) => i !== index));
    setOutputTestcases(outputTestcases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const sampleTest = {
      input: sampleInput,
      output: sampleOutput,
    };

    const testcases = inputTestcases.map((input, index) => ({
      input,
      output: outputTestcases[index],
    }));

    const formData = {
      title,
      timeLimit: Number(timeLimit),
      difficulty,
      description,
      input,
      output,
      sampleTest,
      testcases,
      problemType,
      user: "65ef59e62965aa0a3e11c178",
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/newproblem`,
        formData
      );
      toast.success("Problem Created");
      nav("/problemset");
    } catch (error) {
      toast.error("Error. Please Try Again");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="font-mono max-w-2xl mx-auto p-4">
        <h1 className="font-mono text-2xl font-bold mb-4">
          Create New Problem
        </h1>
        <form onSubmit={handleSubmit} className="font-mono space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="font-mono block font-semibold">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Time Limit */}
          <div>
            <label
              htmlFor="timeLimit"
              className="font-mono block font-semibold"
            >
              Time Limit (in seconds):
            </label>
            <input
              type="number"
              id="timeLimit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label
              htmlFor="difficulty"
              className="font-mono block font-semibold"
            >
              Difficulty:
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="font-mono block font-semibold">
              Description:
            </label>
            <ReactQuill
              value={description}
              onChange={handleDescriptionChange}
              className="font-mono border border-gray-300 rounded focus:outline-none"
            />
          </div>

          {/* Input */}
          <div>
            <label htmlFor="input" className="font-mono block font-semibold">
              Input:
            </label>
            <ReactQuill
              id="input"
              value={input}
              onChange={handleInputChange}
              className="font-mono border border-gray-300 rounded focus:outline-none "
            />
          </div>

          {/* Output */}
          <div>
            <label htmlFor="output" className="font-mono block font-semibold">
              Output:
            </label>
            <ReactQuill
              id="output"
              value={output}
              onChange={handleOutputChange}
              className="font-mono border border-gray-300 rounded focus:outline-none "
            />
          </div>

          {/* Problem Type */}
          <div>
            <label
              htmlFor="problemType"
              className="font-mono block font-semibold"
            >
              Problem Type:
            </label>
            <input
              type="text"
              id="problemType"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <h2 className="font-mono font-semibold mb-2">Sample Test Case:</h2>
            <div className="font-mono flex space-x-2">
              <textarea
                value={sampleInput}
                onChange={handleSampleInputChange}
                className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                placeholder="Sample Test Case Input"
              />
              <textarea
                value={sampleOutput}
                onChange={handleSampleOutputChange}
                className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                placeholder="Sample Test Case Output"
              />
            </div>
          </div>

          {/* Test Cases */}
          <div>
            <h2 className="font-mono font-semibold mb-2">Test Cases:</h2>
            <div>
              {inputTestcases.map((input, index) => (
                <div key={index} className="font-mono flex space-x-2">
                  <div>
                    <label
                      htmlFor={`input${index}`}
                      className="font-mono block"
                    >
                      Input {index + 1}:
                    </label>
                    <textarea
                      id={`input${index}`}
                      value={input}
                      onChange={(e) =>
                        setInputTestcases(
                          inputTestcases.map((item, idx) =>
                            idx === index ? e.target.value : item
                          )
                        )
                      }
                      className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`output${index}`}
                      className="font-mono block"
                    >
                      Output {index + 1}:
                    </label>
                    <textarea
                      id={`output${index}`}
                      value={outputTestcases[index]}
                      onChange={(e) =>
                        setOutputTestcases(
                          outputTestcases.map((item, idx) =>
                            idx === index ? e.target.value : item
                          )
                        )
                      }
                      className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestcase(index)}
                    class="font-mono mt-8 h-10 bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="font-mono mt-4">
              <label className="font-mono block font-semibold">
                New Test Case:
              </label>
              <div className="font-mono flex space-x-2">
                <textarea
                  value={testcaseInput}
                  onChange={handleTestcaseInputChange}
                  className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                  placeholder="Test Case Input"
                />
                <textarea
                  value={testcaseOutput}
                  onChange={handleTestcaseOutputChange}
                  className="font-mono border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                  placeholder="Test Case Output"
                />
              </div>
              <div class="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={handleAddTestcase}
                  class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                  Add Test Case
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div class="flex justify-center mt-4">
            <button
              type="submit"
              class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ProblemForm;
