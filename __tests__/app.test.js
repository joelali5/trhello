const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

const data = require("../db/data/test-data/index");
const {
  boardsMembersData,
  boardsData,
  cardsData,
  cardMembersData,
  commentsData,
  imagesData,
  listsData,
  membersData,
  membersWorkspaceData,
  workspaceData,
} = data;
const seed = require("../db/seeds/seed");

beforeAll(() => {
  return seed({
    boardsMembersData,
    boardsData,
    cardsData,
    cardMembersData,
    commentsData,
    imagesData,
    listsData,
    membersData,
    membersWorkspaceData,
    workspaceData,
  });
});

afterAll(() => {
  return db.end();
});

describe("User Signup and Login", () => {
  describe("POST /Signup", () => {
    test("Should register a new user and save user details to the database", async () => {
      const newMember = {
        email: "joelaliyu29@gmail.com",
        password: "joelali5",
      };
      const response = await request(app).post("/").send(newMember).expect(201);
      expect(response.body.user).toMatchObject({
        member_id: expect.any(Number),
        email: expect.any(String),
        password: expect.any(String),
        firstname: expect.any(String),
        lastname: expect.any(String),
      });
    });
  });

  describe("POST /login", () => {
    let token;
    test("Should return a token when a valid email and password is provided", async () => {
      const member = {
        email: "joelaliyu29@gmail.com",
        password: "joelali5",
      };
      const response = await request(app).post("/login").send(member);
      expect(response.body).toMatchObject({ token: expect.any(String) });
      token = response._body;
    });
  });
});

describe("Social sign-in", () => {
  describe("Google", () => {
    it("should redirect to Google OAuth20 login page", async () => {
      const response = await request(app).get("/google");
      expect(response.status).toEqual(302);
      expect(response.header.location).toMatch(
        /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/
      );
    });
    it("should authenticate user with valid credentials", async () => {
      const response = await request(app).get(
        "/google/callback?code=valid_code"
      );
      expect(response.status).toEqual(302);
      expect(response.text).toBe("Authenticated");
    });
    it("should not authenticate user with invalid credentials", async () => {
      const response = await request(app).get(
        "/google/callback?error=invalid_credentials"
      );
      expect(response.status).toEqual(401);
      expect(response.text).toMatch(/Unauthorized/);
    });
  });

  describe("Microsoft", () => {
    it("should redirect to Microsoft OAuth2 login page", async () => {
      const response = await request(app).get("/microsoft");
      expect(response.status).toEqual(302);
      expect(response.header.location).toMatch(
        /^https:\/\/login\.microsoftonline\.com\/common\/oauth2\/v2\.0\/authorize\?/
      );
    });
    it("should authenticate user with valid credentials", async () => {
      const response = await request(app).get(
        "/microsoft/callback?code=valid_code"
      );
      expect(response.status).toEqual(302);
      expect(response.text).toBe("Authenticated");
    });

    it("should not authenticate user with invalid credentials", async () => {
      const response = await request(app).get(
        "/microsoft/callback?error=invalid_credentials"
      );
      expect(response.status).toEqual(401);
      expect(response.text).toMatch(/Unauthorized/);
    });
  });

  describe("Github", () => {
    it("Should redirect to Github OAuth2 login page", async () => {
      const response = await request(app).get("/github");
      expect(response.status).toEqual(302);
      expect(response.header.location).toMatch(
        /^https:\/\/github\.com\/login\/oauth\/authorize\/?/
      );
    });
    it("Should authenticate user with valid credentials", async () => {
      const response = await request(app).get(
        "/github/callback?code=valid_code"
      );
      expect(response.status).toEqual(302);
      expect(response.text).toBe("Authenticated");
    });
    it("Should not authenticate user with invalid credentials", async () => {
      const response = await request(app).get(
        "/github/callback?error=invalid_credentials"
      );
      expect(response.status).toEqual(401);
      expect(response.text).toMatch(/Unauthorized/);
    });
  });

  describe("Facebook", () => {
    it("Should redirect to Facebook OAuth2 login page", async () => {
      const response = await request(app).get("/facebook");
      expect(response.status).toEqual(302);
      expect(response.header.location).toMatch(
        /^https:\/\/www\.facebook\.com\/v3.2\/dialog\/oauth\/?/
      );
    });
    it("Should authenticate user with valid credentials", async () => {
      const response = await request(app).get(
        "/facebook/callback?code=valid_code"
      );
      expect(response.status).toEqual(302);
      expect(response.text).toBe("Authenticated");
    });
    it("Should not authenticate user with invalid credentials", async () => {
      const response = await request(app).get(
        "/facebook/callback?error=invalid_credentials"
      );
      expect(response.status).toEqual(401);
      expect(response.text).toMatch(/Unauthorized/);
    });
  });
});
