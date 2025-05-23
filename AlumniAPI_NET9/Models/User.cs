using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlumniAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; } // stored as hash

        public virtual ICollection<Graduate> Graduates { get; set; } = new List<Graduate>();

        public User()
        {
            Graduates = new List<Graduate>();
        }
    }
}
