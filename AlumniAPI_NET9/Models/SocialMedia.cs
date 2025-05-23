using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlumniAPI.Models
{
    public class SocialMedia
    {
        public int Id { get; set; }
        public string Type { get; set; } = "";
        public string Url { get; set; } = "";
        public int GraduateId { get; set; }
        public Graduate? Graduate { get; set; }
    }
}
