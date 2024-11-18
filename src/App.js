import React, { useState, useEffect } from "react";
import { RockTypesEnum, rockValues } from "./rockCalculations";

function App() {
  // State variables for ore data and calculations
  const [oreMasses, setOreMasses] = useState({});
  const [oreScus, setOreScus] = useState({});
  const [workOrderFee, setWorkOrderFee] = useState("");
  const [totalMassValue, setTotalMassValue] = useState(0);
  const [netMassValue, setNetMassValue] = useState(0);
  const [workOrderName, setWorkOrderName] = useState("");
  const [duration, setDuration] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [scuInput, setScuInput] = useState("");
  const [scuPurity, setScuPurity] = useState("");
  const [selectedRockType, setSelectedRockType] = useState("");
  const [totalScuValue, setTotalScuValue] = useState(0);

  const SCU_TO_MASS_FACTOR = 682.25;

  const oreColors = {
    Quantainium: "purple",
    Bexalite: "lime",
    Taranite: "green",
    Gold: "gold",
    Diamond: "yellow",
    Borase: "limegreen",
    Laranite: "orange",
    Beryl: "lightyellow",
    Hepaestanite: "darkorange",
    Agricium: "darkgoldenrod",
    Titanium: "goldenrod",
    Tungsten: "orangered",
    Quartz: "brown",
    Copper: "saddlebrown",
    Iron: "darkred",
    Corundum: "dimgray",
    Aluminium: "lightgray",
    Iner: "gray",
  };

  useEffect(() => {
    const savedWorkOrders =
      JSON.parse(localStorage.getItem("workOrders")) || [];
    setWorkOrders(savedWorkOrders);
  }, []);

  useEffect(() => {
    localStorage.setItem("workOrders", JSON.stringify(workOrders));
  }, [workOrders]);

  const handleOreMassChange = (oreTypeKey, mass) => {
    const oreName = RockTypesEnum[oreTypeKey];
    const parsedMass = parseFloat(mass) || 0;

    setOreMasses((prevOreMasses) => ({
      ...prevOreMasses,
      [oreName]: parsedMass,
    }));

    const scuEquivalent = parsedMass / SCU_TO_MASS_FACTOR;
    setOreScus((prevOreScus) => ({
      ...prevOreScus,
      [oreName]: scuEquivalent.toFixed(2),
    }));

    let total = 0;
    for (let oreType in RockTypesEnum) {
      const currentOreName = RockTypesEnum[oreType];
      const currentMass = oreMasses[currentOreName] || 0;
      const scu = currentMass / SCU_TO_MASS_FACTOR;
      const oreValue = scu * rockValues[currentOreName];
      total += oreValue;
    }
    setTotalMassValue(Math.round(total));
    setNetMassValue(Math.round(total - (parseFloat(workOrderFee) || 0)));
  };

  const formatAuec = (value) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
  };

  const calculateScuValue = () => {
    if (scuInput > 0 && scuPurity > 0 && selectedRockType) {
      const scuValue =
        scuInput * rockValues[selectedRockType] * (scuPurity / 100);
      setTotalScuValue(Math.round(scuValue));
    }
  };
  const addWorkOrder = () => {
    const currentTime = new Date().toLocaleString();
    const orderName = workOrderName
      ? `${workOrderName} - ${currentTime}`
      : currentTime;

    const parsedDuration = duration.padStart(5, "0"); // Ensure the format is HHH:MM
    const hours = parseInt(parsedDuration.slice(0, 3), 10) || 0;
    const minutes = parseInt(parsedDuration.slice(3), 10) || 0;

    if (hours > 0 || minutes > 0) {
      const completionTime = new Date();
      completionTime.setHours(completionTime.getHours() + hours);
      completionTime.setMinutes(completionTime.getMinutes() + minutes);

      const nonZeroOres = {};
      let totalMass = 0;
      let totalScu = 0;

      for (const oreName in oreMasses) {
        if (oreMasses[oreName] > 0) {
          const mass = oreMasses[oreName];
          const scu = Math.round(mass / SCU_TO_MASS_FACTOR);
          totalMass += mass;
          totalScu += scu;
          nonZeroOres[oreName] = { mass, scu };
        }
      }

      const newWorkOrder = {
        name: orderName,
        completionTime: completionTime.getTime(),
        ores: nonZeroOres,
        totalMassValue,
        netMassValue,
        totalMass,
        totalScu,
        saved: true,
      };

      setWorkOrders([...workOrders, newWorkOrder]);
      setWorkOrderName("");
      setDuration("");
      setWorkOrderFee("");
      setOreMasses({});
      setOreScus({});
      setTotalMassValue(0);
      setNetMassValue(0);
    }
  };

  const deleteWorkOrder = (index) => {
    const updatedWorkOrders = [...workOrders];
    updatedWorkOrders.splice(index, 1);
    setWorkOrders(updatedWorkOrders);
  };

  const handleEditWorkOrderName = (index, newName) => {
    const updatedWorkOrders = [...workOrders];
    updatedWorkOrders[index].name = newName;
    setWorkOrders(updatedWorkOrders);
  };

  const handleAddNoteToWorkOrder = (index, note) => {
    const updatedWorkOrders = [...workOrders];
    updatedWorkOrders[index].note = note;
    setWorkOrders(updatedWorkOrders);
  };

  const getRemainingTime = (completionTime) => {
    const now = new Date().getTime();
    const remainingTime = completionTime - now;

    if (remainingTime <= 0) return "Work Order Complete";

    const hoursLeft = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutesLeft = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const secondsLeft = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setWorkOrders((orders) => orders.map((order) => ({ ...order })));
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={{
        backgroundImage: `url("/assets/ARGO_Raft.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#fff",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          backgroundColor: "rgba(255, 110, 0, 0.8)",
          fontSize: "54px",
          fontWeight: "bold",
        }}
      >
        STARMORY
      </header>

      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "300px",
          }}
        >
          <h2>Mass Calculator (Work Order)</h2>
          <h3>Enter Mass for Each Ore Type</h3>
          <h4 style={{ color: "white", marginTop: "20px" }}>
            Minable Values Refined
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {Object.keys(RockTypesEnum)
              .sort(
                (a, b) =>
                  rockValues[RockTypesEnum[b]] - rockValues[RockTypesEnum[a]]
              )
              .map((oreTypeKey, index) => {
                const oreName = RockTypesEnum[oreTypeKey];
                const oreColor = oreColors[oreName] || "#fff";
                const oreValue = rockValues[oreName];

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "15px",
                      display: "grid",
                      gridTemplateColumns: "120px 160px 60px 100px",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <label
                      style={{
                        color: oreColor,
                        fontWeight: "bold",
                      }}
                    >
                      {oreName}:
                    </label>
                    <input
                      type="text"
                      placeholder={`Mass of ${oreName}`}
                      value={oreMasses[oreName] || ""}
                      onChange={(e) => {
                        const inputValue = e.target.value.replace(
                          /[^0-9.]/g,
                          ""
                        ); // Remove any non-numeric characters except the dot
                        const parsedValue =
                          inputValue === ""
                            ? ""
                            : Math.max(0, parseFloat(inputValue)); // Allow only positive numbers
                        handleOreMassChange(oreTypeKey, parsedValue);
                      }}
                      style={{
                        padding: "5px",
                        fontSize: "16px",
                        width: "140px",
                      }}
                    />
                    <span>SCU: {oreScus[oreName] || "0"}</span>
                    <span style={{ color: "white", textAlign: "left" }}>
                      {oreValue ? `${oreValue} aUEC` : "N/A"}
                    </span>
                  </div>
                );
              })}
          </div>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ marginBottom: "30px" }}>
              <strong>Total Value (before fee):</strong>{" "}
              {formatAuec(totalMassValue)} aUEC
            </p>
            <p>
              <strong>Net Value (after fee):</strong> {formatAuec(netMassValue)}{" "}
              aUEC
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // Flexible grid layout
              gap: "100px", // Space between the fields
              alignItems: "start", // Align labels above inputs
              marginBottom: "20px",
            }}
          >
            {/* Work Order Fee */}
            <div style={{ textAlign: "center" }}>
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                  display: "block", // Block display to place it above
                  marginBottom: "5px", // Spacing between label and input
                }}
              >
                Work Order Fee:
              </label>
              <input
                type="text"
                placeholder="aUEC"
                value={workOrderFee}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^0-9.]/g, ""); // Only numbers
                  setWorkOrderFee(inputValue);
                }}
                style={{
                  width: "200px",
                  padding: "10px",
                  fontSize: "16px",
                  textAlign: "center",
                  color: "rgba(0, 0, 0, 0.8)",
                  backgroundColor: "rgba(255, 120, 0, 0.8)",
                  border: "2px solid rgba(255, 165, 0, 0.8)",
                  borderRadius: "8px",
                  outline: "none",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
              />
            </div>

            {/* Work Order Name */}
            <div style={{ textAlign: "center" }}>
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Work Order Name:
              </label>
              <input
                type="text"
                placeholder="Enter Name"
                value={workOrderName}
                onChange={(e) => setWorkOrderName(e.target.value)}
                style={{
                  width: "350px",
                  padding: "10px",
                  fontSize: "16px",
                  textAlign: "center",
                  color: "rgba(0, 0, 0, 0.8)",
                  backgroundColor: "rgba(255, 120, 0, 0.8)",
                  border: "2px solid rgba(255, 165, 0, 0.8)",
                  borderRadius: "8px",
                  outline: "none",
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
              />
            </div>

            {/* Duration */}
            <div style={{ textAlign: "center" }}>
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Duration (HHH:MM):
              </label>
              <input
                type="text"
                placeholder="HHH:MM"
                value={duration}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                onChange={(e) => {
                  const validInput = e.target.value.replace(/[^0-9:]/g, ""); // Allow numbers and colon only
                  setDuration(validInput);
                }}
                style={{
                  width: "250px",
                  padding: "10px",
                  fontSize: "16px",
                  textAlign: "center",
                  color: "rgba(0, 0, 0, 0.8)",
                  backgroundColor: "rgba(255, 120, 0, 0.8)",
                  border: "2px solid rgba(255, 165, 0, 0.8)",
                  borderRadius: "8px",
                  outline: "none",
                  boxShadow: inputFocus
                    ? "0 0 10px rgba(255, 120, 0, 0.9)"
                    : "0 0 5px rgba(0, 0, 0, 0.1)",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
              />
            </div>
          </div>

          <button
            onClick={addWorkOrder}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Save Work Order
          </button>
          <h2>Active Work Orders</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {workOrders.map((order, index) => {
              const remainingTime = getRemainingTime(order.completionTime);
              const isComplete = remainingTime === "Work Order Complete";

              return (
                <div
                  key={index}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    backgroundColor: order.saved
                      ? "rgba(255, 110, 0, 0.8)"
                      : "",
                    color: order.saved ? "black" : "#fff",
                    boxShadow: isComplete
                      ? "0px 0px 30px 15px rgba(0, 255, 0, 0.8)" // Bright green glow when complete
                      : "none", // No glow when not complete
                    borderRadius: "8px", // Rounded corners
                    position: "relative", // Enables absolute positioning for the button
                    transition: "box-shadow 0.5s ease-in-out", // Smooth transition for glow
                  }}
                >
                  <h3>{order.name}</h3>

                  {/* Time Remaining or Work Order Complete */}
                  <p
                    style={{
                      fontWeight: "bold",
                      color: isComplete ? "limegreen" : "black", // Bright green when complete
                      textShadow: isComplete
                        ? "0px 0px 15px rgba(0, 255, 0, 0.8)" // Glowing text effect
                        : "none", // No glow when not complete
                      fontSize: isComplete ? "24px" : "16px", // Larger font for "Work Order Complete"
                      transition: "font-size 0.3s ease-in-out", // Smooth font size transition
                    }}
                  >
                    {isComplete
                      ? "Work Order Complete"
                      : `Time Remaining: ${remainingTime}`}
                  </p>

                  <p>
                    <strong>Total Value:</strong>{" "}
                    {formatAuec(order.totalMassValue)} aUEC
                  </p>
                  <p>
                    <strong>Net Value (after fee):</strong>{" "}
                    {formatAuec(order.netMassValue)} aUEC
                  </p>
                  <p>
                    <strong>Total Mass:</strong> {order.totalMass} t
                  </p>
                  <p>
                    <strong>Total SCU:</strong> {order.totalScu} SCU
                  </p>
                  <p>Note: {order.note || "No notes added"}</p>

                  {/* Edit Name Button */}
                  <button
                    onClick={() => {
                      const newName = prompt("Enter new name:", order.name);
                      if (newName) handleEditWorkOrderName(index, newName);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "70px",
                      padding: "5px",
                      cursor: "pointer",
                      backgroundColor: "blue",
                      color: "white",
                      borderRadius: "4px",
                    }}
                  >
                    Edit Name
                  </button>

                  {/* Add Note Button */}
                  <button
                    onClick={() => {
                      const note = prompt("Add a note:");
                      if (note) handleAddNoteToWorkOrder(index, note);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "5px",
                      cursor: "pointer",
                      backgroundColor: "green",
                      color: "white",
                      borderRadius: "4px",
                    }}
                  >
                    Add Note
                  </button>

                  <div>
                    <h4>Ores</h4>
                    {Object.entries(order.ores).map(
                      ([oreName, { mass, scu }]) => (
                        <div
                          key={oreName}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "120px 40px 40px 70px 40px",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <span>{oreName}</span>
                          <span>{scu}</span>
                          <span>SCU</span>
                          <span>{mass}</span>
                          <span>Mass</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Delete Work Order Button */}
                  <button
                    onClick={() => deleteWorkOrder(index)}
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      backgroundColor: "black",
                      color: "red",
                      borderRadius: "4px",
                      border: "1px solid white",
                    }}
                  >
                    Delete Work Order
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            flex: "1",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "300px",
          }}
        >
          <h2>SCU Calculator</h2>
          <div style={{ marginBottom: "20px" }}>
            <label>Rock Type:</label>
            <select
              onChange={(e) => setSelectedRockType(e.target.value)}
              value={selectedRockType}
              style={{
                marginLeft: "50px",
                padding: "5px",
                fontSize: "16px",
              }}
            >
              <option value="">Select a rock type</option>
              {Object.values(RockTypesEnum).map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>SCU:</label>
            <input
              type="number"
              placeholder="Enter SCU"
              value={scuInput}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except the dot
                const parsedValue =
                  inputValue === "" ? "" : Math.max(0, parseFloat(inputValue)); // Allow only positive numbers
                setScuInput(parsedValue);
              }}
              style={{
                marginLeft: "45px",
                padding: "5px",
                fontSize: "16px",
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>Purity (%):</label>
            <input
              type="number"
              placeholder="Enter purity"
              value={scuPurity}
              onChange={(e) => setScuPurity(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                fontSize: "16px",
              }}
            />
          </div>
          <button
            onClick={calculateScuValue}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Calculate SCU Value
          </button>
          <div style={{ marginTop: "20px" }}>
            <p>
              <strong>Total SCU Value:</strong> {formatAuec(totalScuValue)} aUEC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
