// =============================================================================
// Component Helper Functions
// =============================================================================

const ComponentHelpers = {
  switchTabGeneric(containerSelector, tabName, idPrefix = "") {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Remove active class from all tab buttons in this container
    container.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Remove active class from all tab panels in this container
    container.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    // Add active class to clicked tab button
    const tabButton = document.getElementById(
      `${idPrefix ? idPrefix + "-" : ""}${tabName}-tab`
    );
    if (tabButton) {
      tabButton.classList.add("active");
    }

    // Show corresponding panel
    const tabPanel = document.getElementById(
      `${idPrefix ? idPrefix + "-" : ""}${tabName}-panel`
    );
    if (tabPanel) {
      tabPanel.classList.add("active");
    }
  },

  toggleGeneric(toggleId) {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.classList.toggle("active");
    }
  },

  // Demo-specific binding methods
  bindDemoEvents() {
    // Bind demo tab buttons
    document.getElementById("demo-overview-tab")?.addEventListener("click", () => 
      this.switchTabGeneric(".demo-tabs", "overview", "demo")
    );
    document.getElementById("demo-details-tab")?.addEventListener("click", () => 
      this.switchTabGeneric(".demo-tabs", "details", "demo")
    );
    document.getElementById("demo-settings-tab")?.addEventListener("click", () => 
      this.switchTabGeneric(".demo-tabs", "settings", "demo")
    );

    // Bind demo toggles
    document.getElementById("demo-notifications-toggle")?.addEventListener("click", () => 
      this.toggleGeneric("demo-notifications-toggle")
    );
    document.getElementById("demo-autosave-toggle")?.addEventListener("click", () => 
      this.toggleGeneric("demo-autosave-toggle")
    );
    document.getElementById("demo-darkmode-toggle")?.addEventListener("click", () => 
      this.toggleGeneric("demo-darkmode-toggle")
    );

    console.log("🎭 Demo component events bound");
  }
};

export { ComponentHelpers };