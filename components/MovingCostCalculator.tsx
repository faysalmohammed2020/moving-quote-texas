"use client";

import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

// ✅ BIG JSON: { "State": ["City1","City2",...] }
import STATE_CITY_MAP from "@/app/data/states-cities.json";

// টাইপ
type StateCityMap = Record<string, string[]>;

// ✅ US ZIP validation (5-digit OR ZIP+4)
const usZipRegex = /^\d{5}(-\d{4})?$/;

// ✅ Payload type (your current API shape)
type LeadPayload = {
  key: string;
  lead_type: string;
  lead_source: string;
  referer: string;
  from_ip: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  from_state: string;
  from_state_code: string;
  from_city: string;
  from_zip: string;

  to_state: string;
  to_state_code: string;
  to_city: string;
  to_zip: string;

  move_date: string;
  move_size: string;
  car_make: string;
  car_model: string;
  car_make_year: string;
};

// ✅ ipify response type
type IpifyResponse = { ip: string };

// ✅ response from /api/save-form (minimal safe shape)
type SaveFormResponse = {
  message?: string;
  [key: string]: unknown;
};

const MovingCalculator: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referer, setReferer] = useState("Direct");
  const [leadType, setLeadType] = useState("");

  const [fromZip, setFromZip] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("");

  const [toZip, setToZip] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");

  const [movingType, setMovingType] = useState("");
  const [movingDate, setMovingDate] = useState<Date | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fromIp, setFromIp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const movingOptions = [
    "Studio residence",
    "1 bedroom residence",
    "2 bedroom residence",
    "3 bedroom residence",
    "4+ bedroom residence",
    "Office move",
  ];

  // ✅ state list JSON থেকে
  const usStates = useMemo(
    () => Object.keys(STATE_CITY_MAP as StateCityMap),
    []
  );

  // ✅ From cities JSON থেকে (array string)
  const fromCities: string[] = useMemo(() => {
    if (!fromState) return [];
    return (STATE_CITY_MAP as StateCityMap)[fromState] || [];
  }, [fromState]);

  // ✅ To cities JSON থেকে
  const toCities: string[] = useMemo(() => {
    if (!toState) return [];
    return (STATE_CITY_MAP as StateCityMap)[toState] || [];
  }, [toState]);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json() as Promise<IpifyResponse>)
      .then((data) => setFromIp(data.ip))
      .catch(() => {});
    if (document.referrer) setReferer(document.referrer || "Direct");
  }, []);

  useEffect(() => {
    if (fromState && toState) {
      setLeadType(fromState === toState ? "Local" : "International");
    }
  }, [fromState, toState]);

  const handleCalculate = async () => {
    if (submitting) return;

    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = "Name is required.";

    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format.";

    if (!phone) newErrors.phone = "Phone is required.";

    if (!leadType) newErrors.leadType = "Lead type is required.";

    if (!acceptedTerms) newErrors.terms = "You must accept the Terms.";

    // ✅ ONLY US ZIP format validation
    if (!fromZip) newErrors.fromZip = "From ZIP is required.";
    else if (!usZipRegex.test(fromZip))
      newErrors.fromZip = "Enter a valid US ZIP (##### or #####-####).";

    if (!toZip) newErrors.toZip = "To ZIP is required.";
    else if (!usZipRegex.test(toZip))
      newErrors.toZip = "Enter a valid US ZIP (##### or #####-####).";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    setSubmitting(true);

    const [firstName, ...lastNameParts] = name.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    const jsonPayload: LeadPayload = {
      key: "c5QlLF3Ql90DGQr222tIqHd441",
      lead_type: leadType,
      lead_source: referer ? "Website: " + referer : "Website: Direct",
      referer: referer || "Direct",
      from_ip: fromIp,
      first_name: firstName,
      last_name: lastName,
      email: email.trim().toLowerCase(),
      phone: phone.replace(/[^0-9]/g, ""),

      from_state: capitalizeWords(fromState),
      from_state_code: fromState.slice(0, 2).toUpperCase(),
      from_city: capitalizeWords(fromCity),
      from_zip: fromZip,

      to_state: capitalizeWords(toState),
      to_state_code: toState.slice(0, 2).toUpperCase(),
      to_city: capitalizeWords(toCity),
      to_zip: toZip,

      move_date: movingDate?.toISOString().split("T")[0] || "",
      move_size: movingType,
      car_make: "",
      car_model: "",
      car_make_year: "",
    };

    try {
      const response = await fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      });

      if (response.status === 409) {
        toast.error("Email or phone no is duplicate.");
        return;
      }
      if (!response.ok) {
        toast.error("Failed to save form data.");
        return;
      }

      const data: SaveFormResponse = await response.json();

      if (data?.message === "Form submitted successfully") {
        await sendToExternalAPI(jsonPayload);
        toast.success("Form submitted and saved successfully!");
        resetForm();
      } else {
        toast.error("An error occurred while submitting the form.");
      }
    } catch {
      toast.error(
        "There was an issue submitting the form. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sendToExternalAPI = async (jsonPayload: LeadPayload) => {
    const sendingPoint = "/api/moving/receive-leads/receive.php/";
    const headers = new Headers({
      Authorization: "Token token=buzzmoving2017",
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch(sendingPoint, {
        credentials: "include",
        method: "POST",
        headers,
        body: JSON.stringify(jsonPayload),
      });

      const contentType = response.headers.get("content-type");

      // ✅ unknown instead of any
      let result: unknown;

      if (contentType && contentType.includes("application/json")) {
        result = (await response.json()) as unknown;
      } else {
        result = JSON.parse(await response.text()) as unknown;
      }

      await fetch("/api/save-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
    } catch {}
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setFromZip("");
    setFromCity("");
    setFromState("");
    setToZip("");
    setToCity("");
    setToState("");
    setMovingType("");
    setMovingDate(null);
    setAcceptedTerms(false);
    setErrors({});
  };

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="bg-white text-black p-4 border border-gray-300 rounded-xl shadow-md text-sm">
      <h2 className="text-xl font-bold text-center mb-4">
        Moving Cost Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Full Name"
          className={`p-2 border rounded ${errors.name ? "border-red-500" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className={`p-2 border rounded ${errors.email ? "border-red-500" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone"
          className={`p-2 border rounded ${errors.phone ? "border-red-500" : ""}`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* FROM STATE */}
        <select
          className="p-2 border rounded"
          value={fromState}
          onChange={(e) => {
            setFromState(e.target.value);
            setFromCity("");
          }}
        >
          <option value="">From State</option>
          {usStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* FROM CITY */}
        <select
          className="p-2 border rounded"
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          disabled={!fromState}
        >
          <option value="">From City</option>
          {fromCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* FROM ZIP TEXT */}
        <input
          type="text"
          placeholder="From ZIP"
          className={`p-2 border rounded ${errors.fromZip ? "border-red-500" : ""}`}
          value={fromZip}
          onChange={(e) => setFromZip(e.target.value.trim())}
        />
        {errors.fromZip && (
          <p className="text-red-500 text-xs -mt-2">{errors.fromZip}</p>
        )}

        {/* TO STATE */}
        <select
          className="p-2 border rounded"
          value={toState}
          onChange={(e) => {
            setToState(e.target.value);
            setToCity("");
          }}
        >
          <option value="">To State</option>
          {usStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* TO CITY */}
        <select
          className="p-2 border rounded"
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          disabled={!toState}
        >
          <option value="">To City</option>
          {toCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* TO ZIP TEXT */}
        <input
          type="text"
          placeholder="To ZIP"
          className={`p-2 border rounded ${errors.toZip ? "border-red-500" : ""}`}
          value={toZip}
          onChange={(e) => setToZip(e.target.value.trim())}
        />
        {errors.toZip && (
          <p className="text-red-500 text-xs -mt-2">{errors.toZip}</p>
        )}

        <select
          className="p-2 border rounded"
          value={movingType}
          onChange={(e) => setMovingType(e.target.value)}
        >
          <option value="">Select Move Size</option>
          {movingOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="col-span-1 md:col-span-2">
          <DatePicker
            selected={movingDate}
            onChange={(date) => setMovingDate(date)}
            placeholderText="Moving Date"
            minDate={new Date()}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <label className="text-sm">
            I accept the{" "}
            <a href="/terms" className="underline text-blue-600">
              Terms and Conditions
            </a>
          </label>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleCalculate}
          disabled={submitting}
          className="px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Get a Free Quote"}
        </button>
      </div>
    </div>
  );
};

export default MovingCalculator;
