import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./homepage.css";
import doctorImage from "../../Images/doctor-img01.png";
import doctorImage2 from "../../Images/doctor-img02.png";
import doctorImage3 from "../../Images/doctor-img03.jpg";
import serviceIcon1 from "../../Images/BookingIcon.png";
import serviceIcon2 from "../../Images/ChatIcon.png";
import serviceIcon3 from "../../Images/DoctorIcon.png";
import serviceIcon4 from "../../Images/24-7.png";
import serviceIcon5 from "../../Images/hospital.png";
import computerImage from "../../Images/ScreenImage.png";
import screenImage from "../../Images/TvScreen.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";
const Homepage = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. John Doe",
      specialization: "Orthopedics",
      image: doctorImage,
      degrees: ["MBBS", "MD"],

      hospitals: [" ABC Hospital", " XYZ Hospital"],
    },
    {
      id: 2,
      name: "Dr. Jane Smith",
      specialization: "Cardiology",
      image: doctorImage2,
      degrees: ["MBBS", "MS"],

      hospitals: ["ABC Hospital", "XYZ Hospital"],
    },
    {
      id: 3,
      name: "Dr. Emma Brown",
      specialization: "Dermatology",
      image: doctorImage3,
      degrees: ["MBBS", "MD"],

      hospitals: ["ABC Hospital", "XYZ Hospital"],
    },
  ];

  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "How can I book an appointment with a doctor?",
      answer:
        'To book an appointment, you can navigate to the "Book Appointment" section on our website and follow the instructions provided. Alternatively, you can use our mobile app to schedule an appointment.',
    },
    {
      id: 2,
      question: "Can I consult with doctors from any hospital in India?",
      answer:
        "Yes, our platform allows you to connect with doctors from various hospitals across India. You can choose the doctor and hospital that best suit your needs.",
    },
    {
      id: 3,
      question: "Is the consultation fee included in the booking?",
      answer:
        "The consultation fee may vary depending on the doctor and the type of consultation. Some doctors offer free consultations, while others may charge a fee. You will be informed about any fees before confirming your appointment.",
    },
  ]);

  const toggleFAQ = (id) => {
    setFaqs(
      faqs.map((faq) => {
        if (faq.id === id) {
          faq.open = !faq.open;
        } else {
          faq.open = false;
        }
        return faq;
      })
    );
  };

  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDoctorIndex((prevIndex) => (prevIndex + 1) % doctors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [doctors.length]);

  const handleSpecializationClick = (specialization) => {
    console.log(`Clicked on ${specialization}`);
  };

  return (
    <div className="home-container">
      
        <div className="header-section">
          <div className="header-content">
            <div className="header-text">
              <h1>We help patients live a healthy longer life</h1>
              <p className="subtext">
                Providing compassionate care for all your medical needs.Our team
                of dedicated professionals is here to support you every step of
                the way.Experience personalized care tailored to your unique
                health needs.From diagnosis to treatment, we're committed to
                your well-being.
              </p>
            </div>
            <div className="computer-image">
              <img className="tv-image" src={computerImage} alt="Computer" />
              <img
                className="screen-image"
                src={screenImage}
                alt="Booking Icon"
              />
              <div className="mobile-container">
                <img
                  className="mobscreen-image"
                  src={screenImage}
                  alt="Booking Icon"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="doctors-section">
          <h2 className="doc-sec-heading">Our Best Doctors</h2>
          <div className="doctor-container">
            <div
              className="doctor-card"
              style={{
                backgroundImage: `url(${doctors[currentDoctorIndex].image})`,
              }}
            ></div>
            <div className="doctor-info-container">
              <div className="doctor-info">
                <h3 className="doctor-name">
                  {doctors[currentDoctorIndex].name}
                </h3>
                <p className="hom-doc-info">
                  {doctors[currentDoctorIndex].specialization}
                </p>
                <p className="hom-doc-info">
                  <strong>Degrees:</strong>{" "}
                  {doctors[currentDoctorIndex].degrees.join(", ")}
                </p>

                <p className="hom-doc-info">
                  <strong>Hospitals:</strong>{" "}
                  {doctors[currentDoctorIndex].hospitals.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-appointment-section">
          <h2>Book an Appointment Now!</h2>
          <p>
            Take the first step towards better health. Click below to register
            and book your appointment with our expert doctors.
          </p>
          <Link to="/register" className="hom-register-button">
            Register and Book Appointment
          </Link>
        </div>

        <div className="statistics-section">
          <div className="statistics-item">
            <h2>31K+</h2>
            <p>Doctors Onboarded</p>
          </div>
          <div className="statistics-item">
            <h2>900K+</h2>
            <p>Consultations Recorded</p>
          </div>
          <div className="statistics-item">
            <h2>33+</h2>
            <p>Specialties Covered</p>
          </div>
          <div className="statistics-item">
            <h2>4.3</h2>
            <p>Website Ratings</p>
          </div>
        </div>
        <div className="services-section">
          <h2 className="service-heading">Our Services</h2>
          <div className="services-list">
            <div className="service-item">
              <img src={serviceIcon1} alt="Service Icon" />
              <p className="para">Online appointment booking with doctors</p>
            </div>
            <div className="service-item">
              <img src={serviceIcon5} alt="Service Icon" />
              <p className="para">Find Hospital</p>
            </div>
            <div className="service-item">
              <img src={serviceIcon2} alt="Service Icon" />
              <p className="para">Chat with doctors</p>
            </div>
            <div className="service-item">
              <img src={serviceIcon3} alt="Service Icon" />
              <p className="para">Specialized doctors</p>
            </div>
            <div className="service-item">
              <img src={serviceIcon4} alt="Service Icon" />
              <p className="para">24*7 services</p>
            </div>
          </div>
        </div>

        <div className="specialization-section">
          <h2>Specializations we provide</h2>
          <div className="specialization-list">
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Orthopedics")}
            >
              <h3 className="inner-heading">Orthopedics</h3>
              <p>
                Specializing in the diagnosis, treatment, and prevention of
                disorders of the musculoskeletal system, including bones,
                joints, ligaments, tendons, and muscles. Orthopedic doctors
                commonly treat fractures, sports injuries, arthritis, and other
                related conditions.
              </p>
            </div>
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Cardiology")}
            >
              <h3 className="inner-heading">Cardiology</h3>
              <p>
                Specializing in the diagnosis and treatment of heart-related
                conditions, including coronary artery disease, heart failure,
                arrhythmias, and congenital heart defects. Cardiologists often
                perform procedures such as angioplasty, stent placement, and
                pacemaker implantation.
              </p>
            </div>
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Dermatology")}
            >
              <h3 className="inner-heading">Dermatology</h3>
              <p>
                Specializing in the diagnosis and treatment of skin, hair, and
                nail disorders. Dermatologists treat conditions such as acne,
                eczema, psoriasis, skin cancer, and aging-related concerns. They
                may also perform cosmetic procedures like Botox injections and
                laser therapy.
              </p>
            </div>
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Neurology")}
            >
              <h3 className="inner-heading">Neurology</h3>
              <p>
                Specializing in the diagnosis and treatment of disorders
                affecting the nervous system, including the brain, spinal cord,
                nerves, and muscles. Neurologists treat conditions such as
                epilepsy, stroke, Parkinson's disease, multiple sclerosis, and
                neuropathy.
              </p>
            </div>
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Oncology")}
            >
              <h3 className="inner-heading">Oncology</h3>
              <p>
                Specializing in the diagnosis and treatment of cancer.
                Oncologists use various treatment modalities such as
                chemotherapy, radiation therapy, and surgery to manage cancer
                and improve patient outcomes.
              </p>
            </div>
            <div
              className="specialization-box"
              onClick={() => handleSpecializationClick("Gastroenterology")}
            >
              <h3 className="inner-heading">Gastroenterology</h3>
              <p>
                Specializing in the diagnosis and treatment of disorders of the
                digestive system, including the esophagus, stomach, intestines,
                liver, and pancreas. Gastroenterologists manage conditions such
                as acid reflux, ulcers, irritable bowel syndrome (IBS), Crohn's
                disease, and liver diseases.
              </p>
            </div>
          </div>
        </div>
        <div className="reviews-section">
          <h2>Patients Reviews</h2>
          <div className="reviews-list">
            <div className="review-box">
              <p className="review-text">
                I had a wonderful experience with the doctors here. They
                provided thorough explanations of my condition and treatment
                options. The staff was friendly and attentive, making me feel
                comfortable throughout my visit.
              </p>
              <div className="star-rating">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
              </div>
              <p className="review-author">- John Smith</p>
            </div>
            <div className="review-box">
              <p className="review-text">
                I had a wonderful experience with the doctors here. They
                provided thorough explanations of my condition and treatment
                options. The staff was friendly and attentive, making me feel
                comfortable throughout my visit.
              </p>
              <div className="star-rating">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
              </div>
              <p className="review-author">- John Smith</p>
            </div>
            <div className="review-box">
              <p className="review-text">
                I had a wonderful experience with the doctors here. They
                provided thorough explanations of my condition and treatment
                options. The staff was friendly and attentive, making me feel
                comfortable throughout my visit.
              </p>
              <div className="star-rating">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
                <span className="fa fa-star"></span>
              </div>
              <p className="review-author">- John Smith</p>
            </div>
            <div className="review-box">
              <p className="review-text">
                I had a wonderful experience with the doctors here. They
                provided thorough explanations of my condition and treatment
                options. The staff was friendly and attentive, making me feel
                comfortable throughout my visit.
              </p>
              <div className="star-rating">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
              </div>
              <p className="review-author">- John Smith</p>
            </div>
          </div>
        </div>
      

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="faq-heading">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div className={`faq-item ${faq.open ? "open" : ""}`} key={faq.id}>
              <div className="faq-question">
                <h3 className="faq-ques">{faq.question}</h3>
                <button
                  className="faq-toggle"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  {faq.open ? (
                    <FontAwesomeIcon icon={faMinus} />
                  ) : (
                    <FontAwesomeIcon icon={faPlus} />
                  )}
                </button>
              </div>

              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
  <div className="footer-container">
    <div className="footer-section">
      <h3>Connect with Us</h3>
      <div className="social-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook}  />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter}  />
        </a>
      </div>
      <p>Follow us on social media for updates and news.</p>
    </div>
    <div className="footer-section">
      <h3>Contact Information</h3>
      <p>Phone: 123-456-7890</p>
      <p>Email: info@medicare.com</p>
    </div>
    <div className="footer-section">
      <h3>Quick Links</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/">Services</Link></li>
        <li><Link to="/doctors">Doctors</Link></li>
        <li><Link to="/">About Us</Link></li>
        <li><Link to="/">Contact Us</Link></li>
      </ul>
    </div>
    
  </div>
  <div className="footer-bottom">
    <p>&copy; 2024 Medicare. All rights reserved.</p>
  </div>
</div>

    </div>
  );
};

export default Homepage;
