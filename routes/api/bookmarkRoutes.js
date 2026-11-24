import { Router } from 'express';
import Bookmark from '../../models/Bookmark.js';
import { authMiddleware } from '../../utils/auth.js';

const router = Router();

// Every bookmark route needs a logged-in user (a valid token)
router.use(authMiddleware);

// GET /api/bookmarks - Get all bookmarks owned by the logged-in user
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET /api/bookmarks/:id - Get one bookmark (only if you own it)
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: 'No bookmark found with this id!' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User is not authorized to view this bookmark.' });
    }
    res.json(bookmark);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST /api/bookmarks - Create a bookmark owned by the logged-in user
router.post('/', async (req, res) => {
  try {
    const bookmark = await Bookmark.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT /api/bookmarks/:id - Update a bookmark (only if you own it)
router.put('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: 'No bookmark found with this id!' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User is not authorized to update this bookmark.' });
    }
    const updatedBookmark = await Bookmark.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBookmark);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE /api/bookmarks/:id - Delete a bookmark (only if you own it)
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: 'No bookmark found with this id!' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'User is not authorized to delete this bookmark.' });
    }
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bookmark deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
