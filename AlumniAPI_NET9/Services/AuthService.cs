using AlumniAPI.Models;
using AlumniAPI.Data;
using System.Linq;
using BCrypt.Net;

namespace AlumniAPI.Services
{
    public class AuthService
    {
        private readonly AlumniDbContext _db;

        public AuthService(AlumniDbContext db)
        {
            _db = db;
        }

        public User Register(string username, string password)
        {
            if (_db.Users.Any(u => u.Username == username))
                throw new Exception("Username already exists.");

            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };

            _db.Users.Add(user);
            _db.SaveChanges();
            return user;
        }

        public User Login(string username, string password)
        {
            var user = _db.Users.FirstOrDefault(u => u.Username == username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new Exception("Invalid credentials.");

            return user;
        }
    }
}
