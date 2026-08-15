import express from 'express';
import Location from '../models/Location.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/locations
 * @desc    Get all campus locations (optionally filtered by category or search query)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const locations = await Location.find(filter).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch locations from database.',
    });
  }
});

/**
 * @route   POST /api/locations
 * @desc    Create a new campus location
 * @access  Protected (Admin only)
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, lat, lng, description } = req.body;

    if (!name || !category || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, Latitude, and Longitude are all required.',
      });
    }

    const validCategories = ['Hostels', 'Mess', 'Departments', 'Others'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const newLocation = await Location.create({
      name: name.trim(),
      category,
      lat: Number(lat),
      lng: Number(lng),
      description: description ? description.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Location added successfully.',
      data: newLocation,
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create location in database.',
    });
  }
});

/**
 * @route   PUT /api/locations/:id
 * @desc    Update an existing campus location
 * @access  Protected (Admin only)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, lat, lng, description } = req.body;

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found.',
      });
    }

    if (name) location.name = name.trim();
    if (category) {
      const validCategories = ['Hostels', 'Mess', 'Departments', 'Others'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }
      location.category = category;
    }
    if (lat !== undefined) location.lat = Number(lat);
    if (lng !== undefined) location.lng = Number(lng);
    if (description !== undefined) location.description = description.trim();

    const updated = await location.save();

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location in database.',
    });
  }
});

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Protected (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found.',
      });
    }

    await Location.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete location.',
    });
  }
});

export default router;
