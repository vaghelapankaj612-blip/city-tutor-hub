import { useState } from "react";

function SearchTeacherComponent() {
  const [subject, setSubject] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    const searchData = {
      subject,
      keyword,
    };

    console.log("Search Tutor:", searchData);
    alert("Search clicked! Check console for results.");
  };

  return (
    <div className="container-fluid bg-primary my-5 py-5">
      <div className="container py-5">

        <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
          <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">
            Find A Tutor
          </h5>
          <h1 className="display-4 mb-4 text-white">
            Connect With Expert Tutors
          </h1>
          <h5 className="text-white fw-normal">
            Search for tutors by subject or keyword. Find the perfect match for your learning needs and schedule a demo class easily.
          </h5>
        </div>

        <div className="mx-auto" style={{ width: "100%", maxWidth: "600px" }}>
          <div className="input-group">

            <select
              className="form-select border-primary w-25"
              style={{ height: "60px" }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="computer">Computer</option>
            </select>

            <input
              type="text"
              className="form-control border-primary w-50"
              placeholder="Keyword (Tutor Name)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button
              className="btn btn-dark border-0 w-25"
              onClick={handleSearch}
            >
              Search
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SearchTeacherComponent;
