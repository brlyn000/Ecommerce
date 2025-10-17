const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');

router.get('/', carouselController.getAll);
router.get('/:id', carouselController.getById);
router.post('/', carouselController.create);
router.put('/:id', carouselController.update);
router.delete('/:id', carouselController.delete);

module.exports = router;