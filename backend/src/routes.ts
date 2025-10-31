import express from 'express'
import { RegularUser } from './models/RegularUser'
import { LostItemPost } from './models/LostItemPost'
import { Claim } from './models/Claim'
import { Notification } from './models/Notification'
import { SupabaseClientMock } from './supabase/SupabaseClient'

export function createRouter() {
  const router = express.Router()
  const supabase = new SupabaseClientMock()

  router.post('/register', async (req, res) => {
    const user = new RegularUser({
      userID: Date.now(),
      username: String(req.body.username || 'user'),
      email: String(req.body.email || 'user@example.com'),
      password: String(req.body.password || 'secret'),
      profilePicture: String(req.body.profilePicture || '')
    })
    const id = await user.register()
    const result = await supabase.insert('users', { id, email: user.email })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, id })
  })

  router.post('/login', async (req, res) => {
    const user = new RegularUser({
      userID: Number(req.body.userID || 1),
      username: String(req.body.username || 'user'),
      email: String(req.body.email || 'user@example.com'),
      password: String(req.body.password || 'secret'),
      profilePicture: ''
    })
    const ok = await user.login()
    const result = await supabase.select('users', { email: user.email })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, ok })
  })

  router.post('/logout', async (req, res) => {
    const user = new RegularUser({
      userID: Number(req.body.userID || 1),
      username: 'user',
      email: 'user@example.com',
      password: 'secret',
      profilePicture: ''
    })
    const ok = await user.logout()
    res.json({ simulatedFrontend: true, ok })
  })

  router.post('/users/:id/profile', async (req, res) => {
    const user = new RegularUser({
      userID: Number(req.params.id),
      username: String(req.body.username || 'user'),
      email: String(req.body.email || 'user@example.com'),
      password: 'secret',
      profilePicture: String(req.body.profilePicture || '')
    })
    const ok = await user.updateProfile()
    const result = await supabase.update('users', { id: user.userID, username: user.username })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, ok })
  })

  router.post('/posts', async (req, res) => {
    const post = new LostItemPost({
      postID: Date.now(),
      description: String(req.body.description || ''),
      location: String(req.body.location || ''),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      datePosted: new Date()
    })
    const id = post.createPost()
    const result = await supabase.insert('posts', { id, description: post.description })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, id })
  })

  router.put('/posts/:id', async (req, res) => {
    const post = new LostItemPost({
      postID: Number(req.params.id),
      description: String(req.body.description || ''),
      location: String(req.body.location || ''),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      datePosted: new Date()
    })
    const resultUpdate = await post.editPost()
    const result = await supabase.update('posts', { id: post.postID, description: post.description })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, modelUpdate: resultUpdate })
  })

  router.delete('/posts/:id', async (req, res) => {
    const post = new LostItemPost({
      postID: Number(req.params.id),
      description: '',
      location: '',
      images: [],
      datePosted: new Date()
    })
    const ok = await post.deletePost()
    const result = await supabase.delete('posts', { id: post.postID })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, ok })
  })

  router.get('/posts/search', async (req, res) => {
    const count = await LostItemPost.searchItem({ q: String(req.query.q || '') })
    const result = await supabase.select('posts', { q: String(req.query.q || '') })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, count })
  })

  router.post('/claims', async (req, res) => {
    const claim = new Claim({
      claimId: Date.now(),
      claimDetails: String(req.body.claimDetails || ''),
      claimStatus: String(req.body.claimStatus || 'pending'),
      dateClaimed: new Date()
    })
    const ok = await claim.submitClaim()
    const result = await supabase.insert('claims', { id: claim.claimId, status: claim.claimStatus })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, ok })
  })

  router.post('/notifications', async (req, res) => {
    const notification = new Notification({
      notifId: Date.now(),
      message: String(req.body.message || ''),
      dateSent: new Date(),
      status: 'sent'
    })
    const sendResult = await notification.send()
    const result = await supabase.insert('notifications', { id: notification.notifId, message: notification.message })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, modelSend: sendResult })
  })

  router.post('/notifications/:id/read', async (req, res) => {
    const notification = new Notification({
      notifId: Number(req.params.id),
      message: '',
      dateSent: new Date(),
      status: 'sent'
    })
    const resultModel = await notification.markAsRead()
    const result = await supabase.update('notifications', { id: notification.notifId, status: notification.status })
    res.json({ simulatedFrontend: true, simulatedSupabase: result, modelRead: resultModel })
  })

  return router
}

