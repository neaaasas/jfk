// src/pages/AboutPage.jsx
const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">About the JFK Network Project</h1>
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <p className="mb-4">
          This application visualizes the network of people connected to the JFK assassination,
          showing relationships and connections between key individuals involved in this historic event.
        </p>
        <p>
          You can explore the network by clicking on individuals to see their details and connections.
          Use the search feature to find specific people.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;