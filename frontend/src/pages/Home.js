import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import "../styles/Home.css";
import image1 from "../images/images1.jpg";
import image2 from "../images/images2.png";
import image3 from "../images/images3.jpg";
import image4 from "../images/images4.jpg";
import image5 from "../images/images5.png";
import impact from "../images/impact.png"

const Home = () => {
    const blogs = [
        {
            title: "Brain Tumor Detection: How AI is Saving Lives",
            link: "https://www.nature.com/articles/s41698-024-00575-0#:~:text=In%20brain%20tumor%20management%2C%20AI,and%20identifying%20patterns%20not%20easily",
            image: image1,
        },
        {
            title: "Federated Learning: The Future of AI Privacy",
            link: "https://arbisoft.com/blogs/federated-learning-the-future-of-privacy-preserving-machine-learning",
            image: image2,
        },
        {
            title: "Innovations in Medical Imaging",
            link: "https://med.nyu.edu/departments-institutes/radiology/research/technological-innovations",
            image: image3,
        },
        {
            title: "AI in Healthcare: Transforming Diagnostics",
            link: "https://www.healthcareitnews.com/news/ai-transforming-diagnostics",
            image: image4,
        },
        {
            title: "Advances in Privacy-Preserving AI Models",
            link: "https://www.sciencedaily.com/releases/2024/01/240112134507.htm",
            image: image5,
        },
    ];

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="overlay"></div>
                <div className="hero-content">
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Brain Tumor Detection Using Federated Learning
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        Experience groundbreaking AI-driven healthcare solutions that protect privacy and save lives.
                    </motion.p>
                    <motion.a
                        href="#blogs"
                        className="hero-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        Explore Blogs
                    </motion.a>
                </div>
            </section>

            {/* Blog Section */}
            <section id="blogs" className="blogs-section">
                <h2 className="section-title">Latest Blogs</h2>
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {blogs.map((blog, index) => (
                        <SwiperSlide key={index}>
                            <div className="blog-card">
                                <img src={blog.image} alt={blog.title} className="blog-image" />  {/* ✅ Corrected here */}
                                <div className="blog-content">
                                    <h3 className="blog-title">{blog.title}</h3>
                                    <a href={blog.link} className="blog-link" target="_blank" rel="noopener noreferrer">
                                        Read More ➡️
                                    </a>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="about-content">
                    <h2 className="section-title">About Our Project: Revolutionizing Brain Tumor Detection</h2>
                    <p className="about-description">
                        Our project leverages cutting-edge AI technologies, specifically Federated Learning, to enhance the accuracy and speed of brain tumor detection. Traditional AI models require centralized data, which poses significant risks to patient privacy. Federated Learning enables the development of powerful AI models by allowing medical institutions to collaborate without sharing sensitive data. This decentralized approach ensures that patient data remains secure while still allowing AI algorithms to learn from diverse datasets.
                    </p>
                    <p className="about-description">
                        By using Federated Learning, we can train models on data from multiple hospitals and clinics, improving the model’s accuracy across various patient demographics. This method not only ensures privacy but also accelerates the process of brain tumor detection, potentially saving lives by catching tumors at earlier stages. Our goal is to make AI-driven diagnostics a part of standard medical practices, making them accessible to doctors and healthcare providers worldwide.
                    </p>
                </div>
            </section>


            <section className="impact-section">
                <div className="impact-content">
                    <h2 className="section-title">Our Impact: Saving Lives with Early Detection</h2>
                    <p className="impact-description">
                        Since the implementation of our Federated Learning-based model for brain tumor detection, we have successfully identified early-stage tumors in patients who may otherwise have missed the critical window for treatment. Early detection is key in brain tumor treatment, and our AI solution has already helped thousands of patients receive timely interventions, significantly improving their prognosis.
                    </p>

                    <img src={impact} alt="Impact Graph - Early Detection Success" className="impact-graph" />
                    <p className="impact-description">
                        With every new collaboration and data source, our model grows stronger, and the scope of its impact increases. Our vision is to expand access to this life-saving technology across the globe, particularly in under-resourced areas where access to specialized medical professionals and diagnostic tools is limited. Together, we can make a profound impact in the fight against brain tumors and improve the lives of patients worldwide.
                    </p>
                </div>
            </section>



            {/* Footer */}

        </div>
    );
};

export default Home;
