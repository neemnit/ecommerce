"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hook";
import { addAddress, editAddress } from "../features/address/addressSlice";
import { useRouter } from "next/navigation";
import { Address } from "../features/address/addressSlice";

const AddDeliveryAddress: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Select address list and editing state from Redux
  const { isEditing, editAddressId, addresses } = useAppSelector((state) => state.address);

  // Find the address being edited (if applicable)
  const editingAddress = addresses.find((addr) => addr._id === editAddressId) || null;

  const [address, setAddress] = useState<Address>({
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    houseNo: "",
    road: "",
    area: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions

  // Load existing address when in edit mode
  useEffect(() => {
    if (isEditing && editingAddress) {
      setAddress(editingAddress);
    }
  }, [isEditing, editingAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true); // Disable button to prevent multiple submissions

    try {
      let resultAction;
      if (isEditing) {
        resultAction = await dispatch(editAddress({ id: editAddressId!, updatedData: address }));
      } else {
        resultAction = await dispatch(addAddress(address));
      }

      if (addAddress.fulfilled.match(resultAction) || editAddress.fulfilled.match(resultAction)) {
        router.push("/order"); // Navigate to the order page on success
      } else {
        setError(resultAction.payload as string);
        setIsSubmitting(false); // Re-enable button on failure
      }
    } catch (err) {
      setError(err as string);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Back Button and Header */}
      <div className="flex items-center p-4 bg-white shadow">
        <button onClick={() => router.back()} className="text-lg font-medium">
          ← Back
        </button>
        <h2 className="text-lg font-semibold mx-auto">
          {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
        </h2>
      </div>

      {/* Address Form */}
      <div className="flex-1 p-6">
        <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Address Details" : "Enter Address Details"}
          </h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={address.fullName}
                className="w-full p-2 border rounded mt-1"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={address.phone}
                className="w-full p-2 border rounded mt-1"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={address.pincode}
                className="w-full p-2 border rounded mt-1"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  className="w-full p-2 border rounded mt-1"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  className="w-full p-2 border rounded mt-1"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">House No., Building Name</label>
              <input
                type="text"
                name="houseNo"
                value={address.houseNo}
                className="w-full p-2 border rounded mt-1"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Road Name, Area, Colony</label>
              <input
                type="text"
                name="road"
                value={address.road || ""}
                className="w-full p-2 border rounded mt-1"
                onChange={handleChange}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-4 bg-white shadow-md">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full p-3 rounded-lg text-lg ${
            isSubmitting ? "bg-gray-400" : "bg-orange-600 text-white"
          }`}
        >
          {isEditing ? "Update Address" : "Save Address"}
        </button>
      </div>
    </div>
  );
};

export default AddDeliveryAddress;
