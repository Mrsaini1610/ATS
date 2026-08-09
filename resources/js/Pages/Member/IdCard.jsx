import React from "react";
import Modal from "@/Components/Modal";
import { usePage } from "@inertiajs/react";
const IdCard = ({ user, isOpen, onClose }) => {
    console.log(user);
  const generateEmployeeId = () => {
    const deptCode = user?.department?.substring(0, 4).toUpperCase() || "SEPL";
    const year = new Date().getFullYear().toString().substring(2);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${deptCode}${year}${randomNum}`;
  };

  const employeeId = generateEmployeeId();
 const renderBadges = (value, defaultText, badgeClass) => {
    if (!value) {
      return <div className={`badge ${badgeClass}`}>{defaultText}</div>;
    }

    const values = value.split(',').map(v => v.trim());

    return (
      <div className="badge-container">
        {values.map((item, index) => (
          <div key={index} className={`badge ${badgeClass}`}>
            {item}
          </div>
        ))}
      </div>
    );
  };
  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="xl">
      <div className="id-card-modal-content p-4 max-h-[90vh] min-h-[55vh] overflow-y-auto flex flex-col items-center">
        <div className="id-card-header flex justify-between items-center mb-6 w-full max-w-md">
          <h2 className="text-lg font-semibold">Employee ID Card</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>

        <div className="id-card-container flex justify-center">
          <div className="flip-card w-80">
            <div className="flip-card-inner h-full min-h-[400px]">
              <div className="flip-card-front h-full">
                <div className="id-card-front-content h-full flex flex-col justify-between p-4">
                  <div className="id-card-top-section flex justify-between items-start mb-4">
                    <div className="id-card-logo">
                      <img
                        src="/images/logo.png"
                        alt="Company Logo"
                        className="h-10 object-contain"
                      />
                    </div>
                    <div className="id-card-id font-mono text-xs px-2 py-1 rounded">
                      ID: {employeeId}
                    </div>
                  </div>

                  <div className="id-card-photo flex justify-center">
                    <img
                      src={user?.profile_photo_url || "/default-avatar.png"}
                      alt="Employee"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>

                  <div className="id-card-info text-center">
                    <div className="id-card-name font-bold text-lg">{user?.name}</div>
                       <div className="mb-2">
                                                                      <span className=" mb-1">Department</span>
                      {renderBadges(user?.department_names, "Department", "department-badge")}
                    </div>

                    {/* Designation badges */}
                    <div className="mb-2">
                                              <span className=" mb-1">Designation</span>
                      {renderBadges(user?.designation_names, "Designation", "designation-badge")}
                    </div>

                    {/* Role badges */}
                    <div className="id-card-details mt-3">
                      <div className="font-medium mb-1">Role</div>
                      {renderBadges(user?.role_names, "No Role", "role-badge")}
                    </div>
                  </div>

                  <div className="id-card-barcode mt-auto pt-2 flex justify-center">
                    <div className="barcode-placeholder tracking-widest font-mono text-xs p-1 bg-white">
                      {employeeId.split("").join(" ")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="flip-card-back h-full">
                <div className="id-card-back-content h-full flex flex-col justify-between p-4">
                  <div>
                    <h3 className="text-center font-bold">Shashi Engicon </h3>
                    <div className="company-address text-xs text-center mt-2">
                      <p>Mehta Bhawan, Opposite to A.I.R</p>
                      <p>Near Rajdhani Hotel, M.I Road</p>
                      <p>Jaipur - 302001</p>
                    </div>

                    <div className="company-contact text-xs mt-3">
                      <p>Phone: 0141 - 2379509, 2363706, 4040972</p>
                      <p>Email: sales@shashiengicon.com</p>
                      <p>Website: shashiengicon.com</p>
                    </div>
                  </div>

                  <div>
                    <div className="emergency-contact text-xs mt-3">
                      <h4 className="font-medium">In Case of Emergency Please Contact:</h4>
                      <p>HR Department: +91 9799390186</p>
                    </div>

                    <div className="signature-area mt-4">
                      <div className="signature-line border-b border-black w-32 mx-auto"></div>
                      <p className="text-center text-xs mt-1">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IdCard;
