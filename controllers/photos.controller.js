const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
const path = require('path');


/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (title && author && email && file) { // if fields are not empty...
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = path.extname(file.path).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error('Invalid file extension. Only image files are allowed.');
      }

      const sanitizedTitle = title.replace(/(<([^>]+)>)/gi, ''); // Remove HTML tags
      if (sanitizedTitle.length > 25) {
        throw new Error('The maximum number of title characters is 25');
      }

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title: sanitizedTitle, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoId = req.params.id;
    const user = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the user's IP address

    const voter = await Voter.findOne({ user }); // Find the corresponding Voter document
    if (!voter) {
      return res.status(500).json({ message: 'Invalid request.' }); // Assume IP address is already in the database
    }

    const photo = await Photo.findOne({ _id: photoId }); // Find the selected photo
    if (!photo) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (voter.votes.includes(photoId)) {
      return res.status(500).json({ message: 'Already voted for this photo.' }); // Photo has already been voted on
    }

    voter.votes.push(photoId); // Add the photo ID to the voter's votes attribute
    await voter.save(); // Save the Voter document

    photo.votes++; // Increase the number of votes for the photo
    await photo.save();

    res.send({ message: 'OK' });
  } catch (err) {
    res.status(500).json(err);
  }
};
