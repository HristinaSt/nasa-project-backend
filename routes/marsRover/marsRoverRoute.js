// const fastify = require("fastify")({ logger: true });
// const { Pool } = require("pg");
// const axios = require("axios");
// const dotenv = require("dotenv");

// dotenv.config();

// const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT,
// });
// module.exports = async function (fastify) {
//   fastify.get("/mars-photos", async (request, reply) => {
//     try {
//       const currentDate = new Date();
//       const pastDate = new Date(request.query.date);

     
//       const response = await axios.get(
//         `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${pastDate
//           .toISOString()
//           .slice(0, 10)}&api_key=${process.env.API_KEY}`
//       );
      

//       for (const photo of response.data.photos) {
//         // Save rover data if not exists
//         const saveRoverQuery = `
//           INSERT INTO rovers (id, name, status, launch_date, landing_date)
//           VALUES ($1, $2, $3, $4, $5)
//           ON CONFLICT (id)
//           DO NOTHING;
//         `;
//         const rover = photo.rover;
//         await pool.query(saveRoverQuery, [
//           rover.id,
//           rover.name,
//           rover.status,
//           rover.launch_date,
//           rover.landing_date,
//         ]);


//         const saveCameraQuery = `
//           INSERT INTO cameras (id, name, full_name, rover_id)
//           VALUES ($1, $2, $3, $4)
//           ON CONFLICT (id)
//           DO NOTHING;
//         `;
//         const camera = photo.camera;
//         await pool.query(saveCameraQuery, [
//           camera.id,
//           camera.name,
//           camera.full_name,
//           camera.rover_id,
//         ]);


//         const savePhotoQuery = `
//           INSERT INTO mars_photos (id, img_src, earth_date, rover_id, camera_id)
//           VALUES ($1, $2, $3, $4, $5)
//           ON CONFLICT (id)
//           DO NOTHING;
//         `;
//         await pool.query(savePhotoQuery, [
//           photo.id,
//           photo.img_src,
//           photo.earth_date,
//           photo.rover.id,
//           photo.camera.id,
//         ]);
//       }

  
//       return { earth_date: pastDate.toISOString().substr(0, 10), photos: response.data.photos };
//     } catch (error) {
//       console.error(error);
//       reply
//         .status(500)
//         .send({
//           error: `An error occurred while fetching Mars rover photos data: ${error.message}`,
//         });
//     }
//   });

//   fastify.get(
//     "/mars-photos/saved",
//     {
//       schema: {
//         querystring: {
//           type: "object",
//           properties: {
//             startDate: { type: "string", format: "date" },
//             endDate: { type: "string", format: "date" },
//             startId: { type: "integer" },
//             endId: { type: "integer" },
//           },
//           required: ["startDate", "endDate", "startId", "endId"],
//         },
//       },
//     },
//     async (request, reply) => {
//       try {
//         const { startDate, endDate, startId, endId } = request.query;
  
//         const queryParams = [];
//         let query = `
//         SELECT 
//           p.id,
//           p.img_src,
//           p.earth_date,
//           r.id as rover_id,
//           r.name as rover_name,
//           r.status as rover_status,
//           r.launch_date as rover_launch_date,
//           r.landing_date as rover_landing_date,
//           c.id as camera_id,
//           c.name as camera_name,
//           c.full_name as camera_full_name
//         FROM mars_photos p
//         JOIN rovers r ON p.rover_id = r.id
//         JOIN cameras c ON p.camera_id = c.id
//         WHERE 1=1
//       `;
      
//         if (startDate && endDate) {
//           query += ` AND earth_date BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`;
//           queryParams.push(startDate, endDate);
//         }
  
//         if (startId && endId) {
//           query += ` AND id BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`;
//           queryParams.push(startId, endId);
//         }
  
//         const { rows } = await pool.query(query, queryParams);
  
//         return rows.map((row) => row.data);
//       } catch (error) {
//         console.error(error);
//         reply
//           .status(500)
//           .send({
//             error: `An error occurred while fetching Mars rover photos data: ${error.message}`,
//           });
//       }
//     },
//   );
  
//   }




const axios = require("axios");
const dotenv = require("dotenv");

const MarsRoverRepository = require("./marsRoverRepository");

dotenv.config();

module.exports = async function (fastify, options) {
  const marsRoverRepository = new MarsRoverRepository(options.pool);

  fastify.get("/mars-photos", async (request, reply) => {
    try {
      const currentDate = new Date();
      const pastDate = new Date(request.query.date);

      const response = await axios.get(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${pastDate
          .toISOString()
          .slice(0, 10)}&api_key=${process.env.API_KEY}`
      );

      for (const photo of response.data.photos) {
        await marsRoverRepository.saveRover(photo.rover);
        await marsRoverRepository.saveCamera(photo.camera);
        await marsRoverRepository.savePhoto(photo);
      }

      return {
        earth_date: pastDate.toISOString().substr(0, 10),
        photos: response.data.photos,
      };
    } catch (error) {
      console.error(error);
      reply
        .status(500)
        .send({
          error: `An error occurred while fetching Mars rover photos data: ${error.message}`,
        });
    }
  });

  fastify.get(
    "/mars-photos/saved",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            startId: { type: "integer" },
            endId: { type: "integer" },
          },
          required: ["startDate", "endDate", "startId", "endId"],
        },
      },
    },
    async (request, reply) => {
      try {
        const { startDate, endDate, startId, endId } = request.query;
        const photos = await marsRoverRepository.getPhotos(startDate, endDate, startId, endId);
        return photos;
      } catch (error) {
        console.error(error);
        reply
          .status(500)
          .send({
            error: `An error occurred while fetching Mars rover photos data: ${error.message}`,
          });
      }
    },
  );
};
