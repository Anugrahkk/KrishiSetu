/**
 * KrishiSetu - Crop Doctor (OpenCV Engine Frontend)
 * Owned by Member 1 (Frontend & Experience)
 * Adheres strictly to artifacts/design.md, architecture.md, and api.md
 */

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("leaf-file-input");
  const dropzone = document.getElementById("upload-dropzone");
  const previewContainer = document.getElementById("preview-container");
  const previewImg = document.getElementById("preview-img");
  const analyzeBtn = document.getElementById("analyze-btn");
  const scanningCard = document.getElementById("scanning-card");
  const resultCard = document.getElementById("result-card");
  const retryCard = document.getElementById("retry-card");
  const scanHistoryContainer = document.getElementById("scan-history-list");

  let selectedFile = null;

  // -------------------------------------------------------------------------
  // 1. File Selection & Drag-and-Drop
  // -------------------------------------------------------------------------
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    // Validate file type and size (< 5 MB)
    if (!file.type.match("image.*")) {
      showToast("Please upload a JPG or PNG image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5 MB.", "error");
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewContainer.style.display = "block";
      analyzeBtn.disabled = false;
      analyzeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    reader.readAsDataURL(file);

    // Hide previous results
    if (resultCard) resultCard.style.display = "none";
    if (retryCard) retryCard.style.display = "none";
  }

  // -------------------------------------------------------------------------
  // 2. Sample Image Selection (Bundled Fallback for Guaranteed Demo)
  // -------------------------------------------------------------------------
  document.querySelectorAll(".sample-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sampleId = btn.getAttribute("data-sample-id");
      runSampleScan(sampleId);
    });
  });

  async function runSampleScan(sampleNumber) {
    showScanningState();

    try {
      // 20-second timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`/api/scan/sample/${sampleNumber}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        handleScanResponse(data);
      } else {
        // Fallback simulation if backend endpoint is not yet connected
        simulateSampleResponse(sampleNumber);
      }
    } catch (err) {
      console.warn("Backend not yet connected or timeout, showing demo fallback", err);
      simulateSampleResponse(sampleNumber);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Leaf Analysis Execution (POST /api/scan)
  // -------------------------------------------------------------------------
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      if (!selectedFile) {
        showToast("Please select or capture a leaf photo first.", "error");
        return;
      }

      showScanningState();

      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch("/api/scan", {
          method: "POST",
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        handleScanResponse(data);
      } catch (err) {
        console.error("Scan fetch error:", err);
        showRetryState("Connection problem or timeout. Please check lighting and retake in daylight with a plain background.");
      }
    });
  }

  function showScanningState() {
    if (scanningCard) scanningCard.style.display = "block";
    if (resultCard) resultCard.style.display = "none";
    if (retryCard) retryCard.style.display = "none";
    if (analyzeBtn) analyzeBtn.disabled = true;

    scanningCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideScanningState() {
    if (scanningCard) scanningCard.style.display = "none";
    if (analyzeBtn) analyzeBtn.disabled = false;
  }

  // -------------------------------------------------------------------------
  // 4. Handle Response: Success vs. Friendly Retry
  // -------------------------------------------------------------------------
  function handleScanResponse(data) {
    hideScanningState();

    if (data.status === "ok" || (data.ok && data.condition)) {
      renderResultCard(data);
    } else {
      const msg = data.message || "We could not read this photo clearly. Please take it in daylight, one leaf, with a plain background.";
      showRetryState(msg);
    }
  }

  function renderResultCard(data) {
    if (!resultCard) return;

    // Condition title & confidence
    const conditionEl = document.getElementById("result-condition");
    const confidenceBadge = document.getElementById("confidence-badge");
    const severityBadge = document.getElementById("severity-badge");
    const annotatedImg = document.getElementById("annotated-image");
    
    // Info card values
    const affectedPctEl = document.getElementById("stat-affected-pct");
    const spotsFoundEl = document.getElementById("stat-spots-found");
    const severityValEl = document.getElementById("stat-severity-val");
    
    // Meter fill
    const severityFill = document.getElementById("severity-meter-fill");
    const severityPctLabel = document.getElementById("severity-pct-label");
    
    // Advice & disclaimer
    const adviceList = document.getElementById("advice-checklist");
    const disclaimerEl = document.getElementById("result-disclaimer");

    if (conditionEl) conditionEl.textContent = data.condition || "Leaf Condition Analyzed";
    if (confidenceBadge) confidenceBadge.textContent = `${data.confidence || "High"} Confidence`;
    
    const severity = data.severity || "Moderate";
    if (severityBadge) {
      severityBadge.textContent = severity;
      severityBadge.className = `badge badge-${severity.toLowerCase()}`;
    }

    // Set Info Cards
    const affected = parseFloat(data.affected_percent || 0).toFixed(1);
    if (affectedPctEl) affectedPctEl.textContent = `${affected}%`;
    if (spotsFoundEl) spotsFoundEl.textContent = data.spots_found !== undefined ? data.spots_found : "0";
    if (severityValEl) severityValEl.textContent = severity;

    // Severity meter animation
    if (severityFill) {
      severityFill.style.width = `${Math.min(100, Math.max(5, affected))}%`;
      severityFill.className = `severity-fill severity-${severity.toLowerCase()}`;
    }
    if (severityPctLabel) {
      severityPctLabel.textContent = `${affected}% leaf area affected`;
    }

    // Annotated image or preview
    if (annotatedImg) {
      annotatedImg.src = data.annotated_image || previewImg.src;
    }

    // Advice bullet points
    if (adviceList) {
      adviceList.innerHTML = "";
      const adviceArr = Array.isArray(data.advice)
        ? data.advice
        : [
            "Remove and safely dispose of severely infected leaves.",
            "Avoid overhead sprinkler watering; keep foliage dry.",
            "Consult your local Krishibhavan agricultural officer before applying chemical fungicides."
          ];
      adviceArr.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        adviceList.appendChild(li);
      });
    }

    if (disclaimerEl && data.disclaimer) {
      disclaimerEl.textContent = data.disclaimer;
    }

    // Link treatment button to specific inputs
    const treatmentBtn = document.getElementById("treatment-link-btn");
    if (treatmentBtn) {
      const code = data.condition_code || "";
      if (code === "leaf_spot") {
        treatmentBtn.href = "/farmer/inputs?category=manure&q=neem";
        treatmentBtn.innerHTML = "<span>🌱 Find Neem & Bio-Fungicide Inputs →</span>";
      } else if (code === "yellowing") {
        treatmentBtn.href = "/farmer/inputs?category=manure&q=vermicompost";
        treatmentBtn.innerHTML = "<span>🌱 Find Vermicompost & Micronutrients →</span>";
      } else if (code === "powdery") {
        treatmentBtn.href = "/farmer/inputs?q=bio";
        treatmentBtn.innerHTML = "<span>🌱 Find Bio-Control Treatments →</span>";
      } else {
        treatmentBtn.href = "/farmer/inputs";
        treatmentBtn.innerHTML = "<span>🌱 Explore Agri-Inputs & Fertilizers →</span>";
      }
    }

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Scan completed successfully", "success");
  }

  function showRetryState(message) {
    hideScanningState();
    if (!retryCard) return;

    const retryMsgEl = document.getElementById("retry-message");
    if (retryMsgEl) retryMsgEl.textContent = message;

    retryCard.style.display = "block";
    retryCard.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Retake suggested for clearer diagnosis", "info");
  }

  // -------------------------------------------------------------------------
  // 5. Offline / Demo Fallback Simulation (Prevents Any Demo Hiccups)
  // -------------------------------------------------------------------------
  function simulateSampleResponse(sampleId) {
    setTimeout(() => {
      hideScanningState();
      if (sampleId === "1") {
        renderResultCard({
          status: "ok",
          condition: "Healthy Leaf",
          condition_code: "healthy",
          confidence: "High",
          severity: "Mild",
          affected_percent: 2.1,
          spots_found: 0,
          annotated_image: "/static/img/sample-healthy.svg",
          advice: [
            "Leaf demonstrates healthy pigmentation and normal chlorophyll distribution.",
            "Continue regular watering schedule at the root level.",
            "Maintain balanced organic compost application every 3-4 weeks."
          ],
          disclaimer: "Preliminary screening. Confirm with your Krishibhavan."
        });
      } else if (sampleId === "2") {
        renderResultCard({
          status: "ok",
          condition: "Leaf Spot / Blight-like",
          condition_code: "leaf_spot",
          confidence: "High",
          severity: "Moderate",
          affected_percent: 18.4,
          spots_found: 9,
          annotated_image: "/static/img/sample-spotted.svg",
          advice: [
            "Isolate the plant and prune affected spotted foliage to prevent spore spread.",
            "Avoid splash irrigation on leaves; water early morning at base.",
            "Show sample leaves to your local Krishibhavan for recommended organic neem or copper-based sprays."
          ],
          disclaimer: "Preliminary screening. Confirm with your Krishibhavan."
        });
      } else {
        renderResultCard({
          status: "ok",
          condition: "Yellowing / Nutrient Deficiency",
          condition_code: "yellowing",
          confidence: "Medium",
          severity: "Moderate",
          affected_percent: 28.5,
          spots_found: 2,
          annotated_image: "/static/img/sample-yellowing.svg",
          advice: [
            "Check soil moisture and ensure no root waterlogging or poor drainage.",
            "Test soil pH at your Krishibhavan or apply balanced vermicompost and micronutrient mix.",
            "Monitor new growth shoots over the next 7 days."
          ],
          disclaimer: "Preliminary screening. Confirm with your Krishibhavan."
        });
      }
    }, 900);
  }

  // -------------------------------------------------------------------------
  // 6. Recent Scans History (GET /api/scans/mine)
  // -------------------------------------------------------------------------
  async function loadScanHistory() {
    if (!scanHistoryContainer) return;
    try {
      const res = await fetch("/api/scans/mine");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.scans && data.scans.length > 0) {
          scanHistoryContainer.innerHTML = data.scans.map((s) => `
            <div class="info-card" style="margin-bottom: 8px;">
              <div class="info-card-label">${s.created_at || "Recent"}</div>
              <div class="info-card-value" style="font-size: 1rem;">${s.condition_code || "Screening"} - ${s.severity || "Analyzed"}</div>
            </div>
          `).join("");
          return;
        }
      }
    } catch (_) {}
    // Default empty placeholder
    scanHistoryContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No previous scans on record.</p>`;
  }

  loadScanHistory();
});

