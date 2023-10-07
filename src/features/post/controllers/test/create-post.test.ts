  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { Request, Response } from 'express';
  import { Server } from 'socket.io';
  import { authUserPayload } from '@root/mocks/auth.mock';
  import * as postServer from '@socket/post';
  import { newPost, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
  import { postQueue } from '@services/queues/post.queue';
  import { Create } from '@post/controllers/create-post';
  import { PostCache } from '@services/redis/post.cache';
  import { CustomError } from '@global/helpers/error-handler';
  import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

  jest.useFakeTimers();//mock timers used in the code being tested.
  jest.mock('@services/queues/base.queue');
  jest.mock('@services/redis/post.cache');
  jest.mock('@global/helpers/cloudinary-upload');//Jest will replace all the exports from @global/helpers/cloudinary-upload with mock functions.

  // mock the socketIOPostObject export from @socket/post.
  Object.defineProperties(postServer, {
    socketIOPostObject: {
      value: new Server(),
      writable: true
    }
  });

  describe('Create', () => { // class 'Create'
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    describe('post', () => { //first method
      it('should send correct json response', async () => {
        const req: Request = postMockRequest(newPost, authUserPayload) as Request;
        const res: Response = postMockResponse();
        jest.spyOn(postServer.socketIOPostObject, 'emit');
        const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
        jest.spyOn(postQueue, 'addPostJob');

        await Create.prototype.post(req, res);
        const createdPost = spy.mock.calls[0][0].createdPost;
        expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
        expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
          key: spy.mock.calls[0][0].key,
          currentUserId: `${req.currentUser?.userId}`,
          uId: `${req.currentUser?.uId}`,
          createdPost
        });
        expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Post created successfully'
        });
      });
    });

    describe('postWithImage', () => {//second method of the class
      it('should throw an error if image is not available', () => {
        delete newPost.image;
        const req: Request = postMockRequest(newPost, authUserPayload) as Request;
        const res: Response = postMockResponse();

        Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Image is a required field');
        });
      });

      it('should throw an upload error', () => {
        newPost.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
        const req: Request = postMockRequest(newPost, authUserPayload) as Request;
        const res: Response = postMockResponse();
        jest
          .spyOn(cloudinaryUploads, 'uploads')
          .mockImplementation((): any => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));

        Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
          expect(error.statusCode).toEqual(400);
          expect(error.serializeErrors().message).toEqual('Upload error');
        });
      });

      it('should send correct json response', async () => {
        newPost.image = 'testing image';
        const req: Request = postMockRequest(newPost, authUserPayload) as Request;
        const res: Response = postMockResponse();
        jest.spyOn(postServer.socketIOPostObject, 'emit');
        const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
        jest.spyOn(postQueue, 'addPostJob');
        jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

        await Create.prototype.postWithImage(req, res);
        const createdPost = spy.mock.calls[0][0].createdPost;
        expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
        expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
          key: spy.mock.calls[0][0].key,
          currentUserId: `${req.currentUser?.userId}`,
          uId: `${req.currentUser?.uId}`,
          createdPost
        });
        expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Post created with image successfully'
        });
      });
    });
  });
